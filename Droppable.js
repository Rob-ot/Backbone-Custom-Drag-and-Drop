define([
  'wrap!underscore'
],
function (
  _
) {
  var droppables = [], currentHover = null

  function pointInside (pointX, pointY, x, y, w, h) {
    return x <= pointX && x + w >= pointX &&
      y <= pointY && y + h >= pointY
  }

  function isHovering (droppable, dragX, dragY, dragW, dragH) {
    return pointInside(dragX, dragY, droppable.x, droppable.y, droppable.width, droppable.height) // top left
      || pointInside(dragX + dragW, dragY, droppable.x, droppable.y, droppable.width, droppable.height) // top right
      || pointInside(dragX, dragY + dragH, droppable.x, droppable.y, droppable.width, droppable.height) // bottom left
      || pointInside(dragX + dragW, dragY + dragH, droppable.x, droppable.y, droppable.width, droppable.height) // bottom right
  }

  function distance (droppable, dragX, dragY, dragW, dragH) {
    if (!isHovering(droppable, dragX, dragY, dragW, dragH)) return -1
    return Math.sqrt(Math.pow(dragX - droppable.x, 2) + Math.pow(dragY - droppable.y, 2))
  }

  function closestDroppable (x, y, w, h) {
    var dist, closestDistance, droppable, closestView = null
    for (var i = 0; i < droppables.length; i++) {
      droppable = droppables[i]
      dist = distance(droppable, x, y, w, h)
      if (dist !== -1) {
        if (!closestView || dist < closestDistance) {
          closestDistance = dist
          closestView = droppable
        }
      }
    }

    return closestView
  }

  return {
    setDroppable: function (droppable, x, y, w, h) {
      if (droppable) {
        this.enableDroppable(x, y, w, h)
      }
      else {
        this.disableDroppable()
      }
    },

    enableDroppable: function (x, y, w, h) {
      if (this.droppable) return
      this.droppable = true

      if (!this.x) this.x = 0
      if (!this.y) this.y = 0

      droppables.push(this)
    },

    disableDroppable: function () {
      if (!this.droppable) return

      var index = _.indexOf(droppables, this)
      if (index === -1) return console.error("couldnt find droppable, wtf")

      droppables.splice(index, 1)

      this.droppable = false
    },

    _droppableOnDragEnd: function (view, x, y, w, h) {
      var closestView = closestDroppable(x, y, w, h)

      if (currentHover) currentHover.trigger('dropunhover', view)
      currentHover = null

      if (closestView) {
        closestView.trigger('drop', view)
      }

      return closestView
    },

    _droppableOnDragMove: function (view, x, y, w, h) {
      var closestView = closestDroppable(x, y, w, h)

      if (currentHover === closestView) return

      if (currentHover) currentHover.trigger('dropunhover', view)
      if (closestView) closestView.trigger('drophover', view)
      currentHover = closestView
    }
  }
})