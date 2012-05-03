define([
  'wrap!underscore',
  'jquery',
  './Droppable'
],
function (
  _,
  $,
  Droppable
  ) {
  $(window).bind('touchstart', function () {}) // ios hack
  return {
    setDraggable: function (draggable) {
      if (draggable) {
        this.enableDraggable()
      }
      else {
        this.disableDraggable()
      }
    },

    enableDraggable: function () {
      if (this.draggable) return
      this.draggable = true

      if (!this.x) this.x = 0
      if (!this.y) this.y = 0

      if (!this._draggable_downBound) {
        this._draggable_downBound = _.bind(this._draggable_down, this)
        // just do them all now
        this._draggable_moveBound = _.bind(this._draggable_mouseMove, this)
        this._draggable_upBound = _.bind(this._draggable_mouseUp, this)
      }

      this.$el.bind("mousedown touchstart", this._draggable_downBound)      
    },

    disableDraggable: function () {
      if (!this.draggable) return
      this.draggable = false
      this.$el.unbind("mousedown", this._draggable_downBound)
    },

    _draggable_down: function (e) {
      e = e.originalEvent
      if (e.type === 'mousedown' && e.which !== 1) return
      e.preventDefault()
      this.trigger("dragstart")

      if (e.targetTouches) {
        this._draggable_startDragX = e.targetTouches[0].pageX
        this._draggable_startDragY = e.targetTouches[0].pageY

        $(window).bind('touchmove', this._draggable_moveBound)
          .bind('touchend touchcancel', this._draggable_upBound)
      }
      else {
        this._draggable_startDragX = e.clientX
        this._draggable_startDragY = e.clientY
        
        $(window).mousemove(this._draggable_moveBound)
          .mouseup(this._draggable_upBound)
          .mouseleave(this._draggable_upBound)
      }

      this._draggable_startTime = new Date().getTime()
    },

    _draggable_mouseMove: function (e) {
      e = e.originalEvent
      var x, y, changeX, changeY

      if (e.targetTouches) {
        x = e.targetTouches[0].pageX
        y = e.targetTouches[0].pageY
      }
      else {
        x = e.clientX
        y = e.clientY
      }

      changeX = x - this._draggable_startDragX
      changeY = y - this._draggable_startDragY

      this.x += changeX
      this.y += changeY

      this.trigger("dragmove", changeX, changeY)

      Droppable._droppableOnDragMove(this, this.x, this.y, this.width, this.height)

      this._draggable_startDragX = x
      this._draggable_startDragY = y
    },

    _draggable_mouseUp: function () {
      var dropTarget = Droppable._droppableOnDragEnd(this, this.x, this.y, this.width, this.height)

      this.trigger("dragend", dropTarget)

      var dragtime = new Date().getTime() - this._draggable_startTime

      if (dragtime < 130) {
        this.trigger("dragclick")
      }

      $(window).unbind("mousemove touchmove", this._draggable_moveBound)
        .unbind("mousemove mouseup mouseleave touchend touchcancel", this._draggable_upBound)
    }
  }
})
