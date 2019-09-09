const {
  get, uniq, groupBy, mapValues,
  isUndefined, omitBy
} = require('lodash')
const YAML = require('yamljs')
const { validated } = require('../../util/json')

const {
  text: { slugify },
  uuid: generateUuid,
} = require('../../../helpers')

function entityFromPayloadToEntityAndAppearance(e, languageCodes, frequency) {
  const type = get(e, 'type')
  const entity = omitBy({
    slug: get(e, 'slug', slugify(get(e, 'name'))),
    uuid: generateUuid(),
    name: get(e, 'name'),
    entity: get(e, 'entity'),
    metadata: get(e, 'metadata'),
    links: get(e, 'links'),
    first_name: get(e, 'first_name'),
    last_name: get(e, 'last_name'),
    lat: get(e, 'lat'),
    lng: get(e, 'lng'),
    country: get(e, 'country'),
    geoname_id: get(e, 'geoname_id'),
    geocoding_id: get(e, 'geocoding_id'),
  }, isUndefined)

  const appearance = omitBy({
    frequency,
    languages: languageCodes
  }, isUndefined)

  return { entity, appearance, type }
}

/**
 * Create `merge entity` payloads from `create resource` payload.
 *
 * @param {object} payload object satisfying `api/management/create_resource/payload.json`
 *                         JSON schema.
 * @param {string} resourceUuid UUID of resource these entities should be linked to
 * @param {string} username optional username of resource creator.
 *
 * @returns {array} a list of objects { entity, appearance, type } where
 *                  `entity` satisfies `db/entity.json` JSON schema,
 *                  `appearance` satisfies `db/appears_in.json` JSON schema,
 *                  `type` is a type string.
 */
function createResourcePayloadToEntityAndAppearanceList(payload) {
  const validatedInput = validated(payload, 'api/management/create_resource/payload.json')
  const entities = get(validatedInput, 'entities', [])
  const entitiesLocations = get(validatedInput, 'entitiesLocations', [])
  const entitiesLocationsByEntityIndex = groupBy(entitiesLocations, 'entityIndex')

  const languageCodesByEntityIndex = mapValues(entitiesLocationsByEntityIndex,
    items => uniq(items.map(v => v.languageCode)))
  const frequencyByEntityIndex = mapValues(entitiesLocationsByEntityIndex,
    items => items.length)

  return entities
    .map((e, index) => entityFromPayloadToEntityAndAppearance(
      e,
      languageCodesByEntityIndex[index],
      frequencyByEntityIndex[index]
    ))
    .map(({ entity, appearance, type }) => ({
      entity: validated(entity, 'db/entity.json'),
      appearance: validated(appearance, 'db/appears_in.json'),
      type
    }))
}

function entitiesContext(locations, entities) {
  return locations.map(location => {
    const id = get(get(entities, location.entityIndex), 'uuid')
    const context = {
      left: location.leftOffset,
      right: location.rightOffset
    }

    return { id, context }
  })
}

function versionFromEntity(languageCode, entities, locations) {
  const firstEntityIndex = get(locations, '0.entityIndex')
  const firstEntity = get(entities, firstEntityIndex)

  return omitBy({
    service: get(firstEntity, 'entity.ned_model', 'unknown'),
    language: languageCode,
    yaml: YAML.stringify(entitiesContext(locations, entities)),
  }, isUndefined)
}

/**
 * Create `merge relationship resource version` payloads from `create resource` payload.
 *
 * These payloads link a group of entities in the same language to locations in resource text.
 *
 * @param {object} payload object satisfying `api/management/create_resource/payload.json`
 *                         JSON schema.
 * @param {array} entities a list of objects satisfying `db/entity.json` schema
 *
 * @returns {array} a list of objects satisfying `db/version.json`
 */
function createResourcePayloadToVersionList(payload, entities) {
  const validatedInput = validated(payload, 'api/management/create_resource/payload.json')
  const entitiesLocations = get(validatedInput, 'entitiesLocations', [])
  const entitiesLocationsByLanguageCode = groupBy(entitiesLocations, 'languageCode')

  return Object.keys(entitiesLocationsByLanguageCode)
    .map(languageCode => {
      const locations = entitiesLocationsByLanguageCode[languageCode]

      return versionFromEntity(
        languageCode, entities, locations
      )
    })
    .map(v => validated(v, 'db/version.json'))
}

module.exports = {
  createResourcePayloadToEntityAndAppearanceList,
  createResourcePayloadToVersionList
}