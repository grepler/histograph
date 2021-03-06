/* eslint-env mocha */
const assert = require('assert')
const {
  getDateAggregationQuery,
  getCountAggregationQuery
} = require('../../../../../lib/logic/explorer/aspects/topicModellingScores')

const trimMultiline = s => s.split(/\n/).map(l => l.trim()).filter(l => l !== '').join('\n')

const assertQueriesEqual = (q1, q2) => assert.equal(
  trimMultiline(q1),
  trimMultiline(q2)
)

describe('aggregation queries', () => {
  describe('date based', () => {
    it('generates correct query without dates', () => {
      const query = getDateAggregationQuery()
      assertQueriesEqual(query, `
        WITH null AS ids
        MATCH (res:resource)
        WHERE
          true
        WITH res, ids
        ORDER BY res.start_time ASC
        WITH
          res.start_month AS aggregationKey,
          collect(res) AS bucket
        WITH
          aggregationKey,
          bucket,
          [i in bucket where i.topic_modelling__scores is not null | i.topic_modelling__scores] AS aggregatable
        RETURN
          aggregationKey,
          head(bucket).uuid as firstResourceUuid,
          last(bucket).uuid as lastResourceUuid,
          size(bucket) as totalResources,
          head(bucket).start_date AS minStartDate,
          last(bucket).start_date AS maxStartDate,
          aggregatable
        `)
    })
    it('generates correct query with dates', () => {
      const query = getDateAggregationQuery(123, 456)
      assertQueriesEqual(query, `
        WITH null AS ids
        MATCH (res:resource)
        WHERE
          res.start_time >= {fromTime} AND res.start_time <= {toTime} AND
          true
        WITH res, ids
        ORDER BY res.start_time ASC
        WITH
          res.start_month AS aggregationKey,
          collect(res) AS bucket
        WITH
          aggregationKey,
          bucket,
          [i in bucket where i.topic_modelling__scores is not null | i.topic_modelling__scores] AS aggregatable
        RETURN
          aggregationKey,
          head(bucket).uuid as firstResourceUuid,
          last(bucket).uuid as lastResourceUuid,
          size(bucket) as totalResources,
          head(bucket).start_date AS minStartDate,
          last(bucket).start_date AS maxStartDate,
          aggregatable
        `)
    })
  })
  describe('count based', () => {
    it('generates correct query without dates', () => {
      const query = getCountAggregationQuery(5)
      assertQueriesEqual(query, `
        WITH null AS ids
        MATCH (res:resource)
        WHERE
          true
        WITH res, ids
        ORDER BY res.start_time ASC
        WITH
          collect(res) AS items
        WITH
          items,
          toInteger(floor(size(items) / 5)) AS step
        UNWIND range(0, size(items), step) AS i
        WITH
          items[i..i+step] AS bucket,
          i AS aggregationKey
        WITH
          bucket,
          aggregationKey,
          [i in bucket where i.topic_modelling__scores is not null | i.topic_modelling__scores] AS aggregatable
        RETURN
          aggregationKey,
          head(bucket).uuid as firstResourceUuid,
          last(bucket).uuid as lastResourceUuid,
          size(bucket) as totalResources,
          head(bucket).start_date AS minStartDate,
          last(bucket).start_date AS maxStartDate,
          aggregatable
      `)
    })
  })
})
