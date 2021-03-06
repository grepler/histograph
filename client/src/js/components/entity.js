import { isNumber } from 'lodash'
import { withStyles, theme } from '../styles'

const styles = {
  entity: {
    display: 'flex',
    flexDirection: 'row'
  },
  entityControls: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '& button': {
      marginLeft: theme.units(1)
    },
  },
  entityDetails: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginLeft: theme.units(2),
    '& .badge': {
      minWidth: 'auto',
      borderRadius: theme.units(0.3),
      marginLeft: theme.units(1)
    },
    '& a': {
      color: 'inherit',
      '&:hover': {
        textDecoration: 'underline'
      }
    }
  },
  entityText: {
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    '& .mentions': {
      fontSize: '10px',
      lineHeight: '12px',
      fontWeight: 500,
      color: theme.colours.text.light.secondary
    }
  }
}

const MentionScheme = {
  0: 'not mentioned anywhere',
  1: 'mentioned in {} document',
  other: 'mentioned in {} documents'
}

const entityItemTemplate = /* html */ `
<div class="{{classes.entity}}">
  <div class="{{classes.entityControls}}">
    <ng-transclude class="{{classes.entity}}"></ng-transclude>
  </div>
  <div class="{{classes.entityDetails}}">
    <p class="{{classes.entityText}}">
      <a href="/e/{{entity.uuid}}">{{entity.name}}</a>
      <ng-pluralize ng-if="isNumber(entity.mentions)"
                    class="mentions"
                    count="entity.mentions"
                    when="mentionScheme">
      </ng-pluralize>
    </p>
    <span class="badge">{{entity.type}}</span>
  </div>
</div>
`

const directive = {
  restrict: 'E',
  template: entityItemTemplate,
  transclude: true,
  link($scope) {
    withStyles($scope, styles)
    $scope.isNumber = isNumber
    $scope.mentionScheme = MentionScheme
  },
  scope: {
    entity: '=',
    totalEntities: '=',
    pinResource: '&onPin'
  }
}

angular.module('histograph')
  .directive('hiEntityItem', () => directive)
