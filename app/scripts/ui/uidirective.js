// app.ui.directives Module
// ====================================================================
// This file should included in your project.
//
// - Squaredesigns.net -


"use strict";
angular.module("app.ui.directives", [])

/**************************************
  :: UI Not Close On Click Directive
***************************************/

.directive("uiNotCloseOnClick", [
   function() {
     return {
       restrict: "A",
       compile: function(ele) {
          return ele.on("click", function(event) {
            return event.stopPropagation()
           })
         }
      }
   }
])

/**************************************
  :: Slim Scroll Directive
***************************************/
	
.directive("slimScroll", [
  function() {
    return {
      restrict: "A",
      link: function(scope, ele, attrs) {
        return ele.slimScroll({
          height: attrs.scrollHeight || "100%"
        });
      }
    };
  }
]);