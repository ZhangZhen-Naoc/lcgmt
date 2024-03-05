/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = {
    /***/ 7338: /***/ function (module) {
      (function (global, factory) {
        true ? (module.exports = factory()) : 0;
      })(this, function () {
        "use strict";

        /*
         * https://github.com/kraaden/autocomplete
         * Copyright (c) 2016 Denys Krasnoshchok
         * MIT License
         */
        function autocomplete(settings) {
          // just an alias to minimize JS file size
          var doc = document;
          var container = settings.container || doc.createElement("div");
          var containerStyle = container.style;
          var userAgent = navigator.userAgent;
          var mobileFirefox = ~userAgent.indexOf("Firefox") && ~userAgent.indexOf("Mobile");
          var debounceWaitMs = settings.debounceWaitMs || 0;
          var preventSubmit = settings.preventSubmit || false;
          var disableAutoSelect = settings.disableAutoSelect || false;
          // 'keyup' event will not be fired on Mobile Firefox, so we have to use 'input' event instead
          var keyUpEventName = mobileFirefox ? "input" : "keyup";
          var items = [];
          var inputValue = "";
          var minLen = 2;
          var showOnFocus = settings.showOnFocus;
          var selected;
          var keypressCounter = 0;
          var debounceTimer;
          if (settings.minLength !== undefined) {
            minLen = settings.minLength;
          }
          if (!settings.input) {
            throw new Error("input undefined");
          }
          var input = settings.input;
          container.className = "autocomplete " + (settings.className || "");
          // IOS implementation for fixed positioning has many bugs, so we will use absolute positioning
          containerStyle.position = "absolute";
          /**
           * Detach the container from DOM
           */
          function detach() {
            var parent = container.parentNode;
            if (parent) {
              parent.removeChild(container);
            }
          }
          /**
           * Clear debouncing timer if assigned
           */
          function clearDebounceTimer() {
            if (debounceTimer) {
              window.clearTimeout(debounceTimer);
            }
          }
          /**
           * Attach the container to DOM
           */
          function attach() {
            if (!container.parentNode) {
              doc.body.appendChild(container);
            }
          }
          /**
           * Check if container for autocomplete is displayed
           */
          function containerDisplayed() {
            return !!container.parentNode;
          }
          /**
           * Clear autocomplete state and hide container
           */
          function clear() {
            // prevent the update call if there are pending8AJAX requests
            keypressCounter++;
            items = [];
            inputValue = "";
            selected = undefined;
            detach();
          }
          /**
           * Update autocomplete position
           */
          function updatePosition() {
            if (!containerDisplayed()) {
              return;
            }
            containerStyle.height = "auto";
            containerStyle.width = input.offsetWidth + "px";
            var maxHeight = 0;
            var inputRect;
            function calc() {
              var docEl = doc.documentElement;
              var clientTop = docEl.clientTop || doc.body.clientTop || 0;
              var clientLeft = docEl.clientLeft || doc.body.clientLeft || 0;
              var scrollTop = window.pageYOffset || docEl.scrollTop;
              var scrollLeft = window.pageXOffset || docEl.scrollLeft;
              inputRect = input.getBoundingClientRect();
              var top = inputRect.top + input.offsetHeight + scrollTop - clientTop;
              var left = inputRect.left + scrollLeft - clientLeft;
              containerStyle.top = top + "px";
              containerStyle.left = left + "px";
              maxHeight = window.innerHeight - (inputRect.top + input.offsetHeight);
              if (maxHeight < 0) {
                maxHeight = 0;
              }
              containerStyle.top = top + "px";
              containerStyle.bottom = "";
              containerStyle.left = left + "px";
              containerStyle.maxHeight = maxHeight + "px";
            }
            // the calc method must be called twice, otherwise the calculation may be wrong on resize event (chrome browser)
            calc();
            calc();
            if (settings.customize && inputRect) {
              settings.customize(input, inputRect, container, maxHeight);
            }
          }
          /**
           * Redraw the autocomplete div element with suggestions
           */
          function update() {
            // delete all children from autocomplete DOM container
            while (container.firstChild) {
              container.removeChild(container.firstChild);
            }
            // function for rendering autocomplete suggestions
            var render = function (item, currentValue) {
              var itemElement = doc.createElement("div");
              itemElement.textContent = item.label || "";
              return itemElement;
            };
            if (settings.render) {
              render = settings.render;
            }
            // function to render autocomplete groups
            var renderGroup = function (groupName, currentValue) {
              var groupDiv = doc.createElement("div");
              groupDiv.textContent = groupName;
              return groupDiv;
            };
            if (settings.renderGroup) {
              renderGroup = settings.renderGroup;
            }
            var fragment = doc.createDocumentFragment();
            var prevGroup = "#9?$";
            items.forEach(function (item) {
              if (item.group && item.group !== prevGroup) {
                prevGroup = item.group;
                var groupDiv = renderGroup(item.group, inputValue);
                if (groupDiv) {
                  groupDiv.className += " group";
                  fragment.appendChild(groupDiv);
                }
              }
              var div = render(item, inputValue);
              if (div) {
                div.addEventListener("click", function (ev) {
                  settings.onSelect(item, input);
                  clear();
                  ev.preventDefault();
                  ev.stopPropagation();
                });
                if (item === selected) {
                  div.className += " selected";
                }
                fragment.appendChild(div);
              }
            });
            container.appendChild(fragment);
            if (items.length < 1) {
              if (settings.emptyMsg) {
                var empty = doc.createElement("div");
                empty.className = "empty";
                empty.textContent = settings.emptyMsg;
    1           container.appendChild(empty);
              } else {
                clear();
                return;
              }
            }
            attach();
            updatePosition();
            updateScroll();
          }
          function updateIfDisplayed() {
            if (containerDisplayed()) {
              update();
            }
          }
          function resizeEventHandler() {
            updateIfDisplayed();
          }
          function scrollEventHandler(e) {
            if (e.target !== container) {
              updateIfDisplayed();
            } else {
              e.preventDefault();
            }
          }
          function keyupEventHandler(ev) {
            var keyCode = ev.which || ev.keyCode || 0;
            var ignore = settings.keysToIgnore || [
              38 /* Up */, 13 /* Enter */, 27 /* Esc */, 39 /* Right */, 37 /* Left */, 16 /* Shift */, 17 /* Ctrl */, 18 /* Alt */,
              20 /* CapsLock */, 91 /* HindowsKey */, 9 /* Tab */,
            ];
            for (var _i = 0, ignore_1 = ignore; _i < ignore_1.length; _i++) {
              var key = ignore_1[_i];
              if (keyCode === key) {
                return;
              }
            }
            if (keyCode >= 112 /* F1 */ && keyCode <= 123 /* F12 */ && !settings.keysToIgnore) {
              return;
            }
            // the down key is used to open autocomplete
            if (keyCode === 40 /* Down */ && containerDisplayed()) {
              return;
            }
            startFetch(0 /* Keyboard */);
          }
          /**
           * Automatically move scroll bar if selected item is not visible
           */
          function updateScroll() {
            var elements = container.getElementsByClassName("selected");
            if (elements.length > 0) {
              var element = elements[0];
              // make group visible
              var previous = element.previousElementSibling;
              if (previous && previous.className.indexOf("group") !== -1 && !previous.previousElementSibling) {
                element = previous;
              }
              if (element.offsetTop < container.scrollTop) {
                container.scrollTop = element.offsetTop;
              } else {
                var selectBottom = element.offsetTop + element.offsetHeight;
                var containerBottom = container.scrollTop + container.offsetHeight;
                if (selectBottom > containerBottom) {
                  container.scrollTop += selectBottom - containerBottom;
                }
              }
            }
          }
          /**
           * Select the previous item in suggestions
           */
          function selectPrev() {
            if (items.length < 1) {
              selected = undefined;
            } else {
              if (selected === items[0]) {
                selected = items[items.length - 1];
              } else {
                for (var i = items.length - 1; i > 0; i--) {
                  if (selected === items[i] || i === 1) {
                    selected = items[i - 1];
                    break;
                  }
                }
              }
            }
          }
          /**
           * Select the next item in suggestions
           */
          function selectNext() {
            if (items.length < 1) {
              selected = undefined;
            }
            if (!selected || selected === items[items.length - 1]) {
              selected = items[0];
              return;
            }
            for (var i = 0; i < items.length - 1; i++) {
              if (selected === items[i]) {
                selected = items[i + 1];
                break;
              }
            }
          }
          function keydownEventHandler(ev) {
            var keyCode = ev.which || ev.keyCode || 0;
            if (keyCode === 38 /* Up */ || keyCode === 40 /* Down */ || keyCode === 27 /* Esc */) {
              var containerIsDisplayed = containerDisplayed();
              if (keyCode === 27 /* Esc */) {
                clear();
              } else {
                if (!containerIsDisplayed || items.length < 1) {
                  return;
                }
                keyCode === 38 /* Up */ ? selectPrev() : selectNext();
                update();
              }
              ev.preventDefault();
              if (containerIsDisplayed) {
                ev.stopPropagation();
              }
              return;
            }
            if (keyCode === 13 /* Enter */) {
              if (selected) {
                settings.onSelect(selected, input);
                clear();
              }
              if (preventSubmit) {
                ev.preventDefault();
              }
            }
          }
          function focusEventHandler() {
            if (showOnFocus) {
              startFetch(1 /* Focus */);
            }
          }
          function startFetch(trigger) {
            // If multiple keys were pressed, before we get an update from server,
            // this may cause redrawing autocomplete multiple times after the last key was pressed.
            // To avoid this, the number of times keyboard was pressed will be saved and checked before redraw.
            var savedKeypressCounter = ++keypressCounter;
            var inputText = input.value;
            var cursorPos = input.selectionStart || 0;
            if (inputText.length >= minLen || trigger === 1 /* Focus */) {
              clearDebounceTimer();
              debounceTimer = window.setTimeout(
                function () {
                  settings.fetch(
                    inputText,
                    function (elements) {
                      if (keypressCounter === savedKeypressCounter && elements) {
                        items = elements;
                        inputValue = inputText;
                        selected = items.length < 1 || disableAutoSelect ? undefined : items[0];
                        update();
                      }
                    },
                    trigger,
                    cursorPos
                  );
                },
                trigger === 0 /* Keyboard */ ? debounceWaitMs : 0
              );
            } else {
              clear();
            }
          }
          function blurEventHandler() {
            // we need to delay clear, because when we click on an item, blur will be called before click and remove items from DOM
            setTimeout(function () {
              if (doc.activeElement !== input) {
                clear();
              }
            }, 200);
          }
          /**
           * Fixes #26: on long clicks focus will be lost and onSelect method will not be called
           */
          container.addEventListener("mousedown", function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
          });
          /**
           * Fixes #30: autocomplete closes when scrollbar is clicked in IE
           * See: https://stackoverflow.com/a/9210267/13172349
           */
          container.addEventListener("focus", function () {
            return input.focus();
          });
          /**
           * This function will remove DOM elements and clear event handlers
           */
          function destroy() {
            input.removeEventListener("focus", focusEventHandler);
            input.removeEventListener("keydown", keydownEventHandler);
            input.removeEventListener(keyUpEventName, keyupEventHandler);
            input.removeEventListener("blur", blurEventHandler);
            window.removeEventListener("resize", resizeEventHandler);
            doc.removeEventListener("scroll", scrollEventHandler, true);
            clearDebounceTimer();
            clear();
          }
          // setup event handlers
          input.addEventListener("keydown", keydownEventHandler);
          input.addEventListener(keyUpEventName, keyupEventHandler);
          input.addEventListener("blur", blurEventHandler);
          input.addEventListener("focus", focusEventHandler);
          window.addEventListener("resize", resizeEventHandler);
          doc.addEventListener("scroll", scrollEventHandler, true);
          return {
            destroy: destroy,
          };
        }

        return autocomplete;
      });
      //# sourceMappingURL=autocomplete.js.map

      /***/
    },

    /***/ 9724: /***/ (module, __webpack_exports__, __webpack_require__) => {
      "use strict";
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ Z: () => __WEBPACK_DEFAULT_EXPORT__,
        /* harmony export */
      });
      /* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(4015);
      /* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
      /* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default =
        /*#__PURE__*/ __webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
      // Imports

      var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()(
        _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()
      );
      // Module
      ___CSS_LOADER_EXPORT___.push([
        module.id,
        ".aladin-container {\n\tposition: relative;\n\tborder: 1px solid #ddd;\n    height: 100%;\n    /*overflow: hidden;*/\n}\n\n\n.aladin-imageCanvas {\n\tposition: absolute;\n    z-index: 1;\n\tleft: 0;\n\ttop: 0;\n}\n\n.aladin-catalogCanvas {\n    position: absolute;\n    z-index: 2;\n    left: 0;\n    top: 0;\n}\n\n.aladin-logo-container {\n    position: absolute;\n\tbottom: 2px;\n    right: 5px;\n\tz-index: 20;\n\n    min-width: 32px;\n    max-width: 90px;\n}\n\n.aladin-logo-small {\n    padding: 0;\n\tbackground: url(data:image/gif;base64,R0lGODlhIAAgAJEAAJIsLdEwJAdMmP///yH5BAkAAAMALAAAAAAgACAAAAjMAAcIHEiwoMGDCBMqXMiwocOHECMaFCCxYkKKAAoK2MiRo0UBAEKKFOkxYUaCIEMSHBlyo0OQCke6HHDyJEWBKgcG2MlzoEyFMAXyHNqTZsubNFGeHLDT4FCcLREGZUqwaFGRUk82FfqUaQCoSH0OCLqVqlCuX42u9Kl1a1qzXnGGVaozLdG6cpMWxOrVblm4AOYOTNn2L1efYZdu5Eu0cV6cE0fW7QqV4WK+CAMLPnhZMtvAEDmy/CkWMtCOHVFaXC2VtevXsGPLZhgQADs=);\n    background-size: 100%;\n    background-repeat: no-repeat;\n    padding-top: 100%; /* aspect ratio of the background image */\n}\n\n.aladin-logo-large {\n    padding: 0;\n    background:  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI4AAABTCAMAAAB+g8/LAAACx1BMVEVMaXGBYYSWk5i7ur1fGUW0Fzbi4OP////Qz9K2s7f////qyseffX7TxczMytBXU1ndrahOWXi0o7RaH0v///+1GjfYkY29srb///+1GTe0Fzajn6RgFkFdHkni3+GLV3PU0dXMubr6+vpmIktUJVKiGDqGcX7p5ujLwMJgFkFgFkFNOWnp1tZaHUi0FzaEZohkX2VVKVXUwcvy8vI4U4tQMWBXIk+NGT9ZIEx+Wn5vF0EUYqF3c3lgFkL5+PkUYqH///////9lFkG0FzYUYqFeNF/BwMs2WpP6+vrBv8JSJ1TNy85TJlO0FzaJhYsUYqF5GEEUYqF2Zo60FzazFza0FzYUYqGWdIsrWpWTGj6jGDp3Kk58Y4S0FzZgFkFXIU2OiY+vmqVhGENlGEJqQ2z///9SKFJTJlP///9pF0GOjpd0Ol6rFzi9sbm0Fza0FzYUYqGXmLp3TXJmHkhLSXy/jJBVK1ivrLDu7e7l5OYLCw6AYYRpFkGCIUYVYqGAZoqJfofez9hZPGtcW4phFkIUYqGVbG1BToTFw8ZqZGr4+PmIGkAWYqD6+vpaHUoUYqGEZoh5ZH2ceYAbGyCmFzmgGjsUYqGAYIOuiJJ3SW1PZJlNM0OliJ+MQF5uF0Gcmp8kXZpSKFWEZojDwcXq1tQzVY9pN2CyFzbZlZFHbKOZgpWjnaRlMlsUYqGHGD9FRElaHUiZfpfW1dddW2HMtsJ3k8NTJlPDT1WlMElcGkY6UYjMa2tDSH3IpKOEZoiFTWqni54DAwQsLDGsqa3Pu8cUFBnEtr8gHyU4Nz3cwsMKDA/GV1tGRUtCKjDczM7NfXzMvcza1Nv///+9PUmhfZRxY2y2KT/15eLo4ud5fKXCXmTnu7ekZ3pgFkFTJlOEZoiUGT5aHkp8GEBzF0G0FzadGDtKQnNeJ1JqJk5fGEReGkaDGT8UYqGlSw8iAAAAwXRSTlMA87vu8R/SwN6iQP7+/vf9/J75s4DT/v0gokr33vzj++7+9/Hz8/3u1tFw9P4f5nP9cvl0/vb+/vL79HH9++WPMFA7s1r++vRhscXEiWT9PvLQ+Ffzih/9/vb+9z3Enn7N/cWI/RDWPND+9/38gTx6uPj5/fn+/efauu7k8fnl0+ro/f33wvj7meDU2PeaZquWH9jJ1O0QrPfC0vXo+uHj+J7ETZvkpfzI+6e44qCorUr22cpX3xDd9VdUvtb6V9z+sGF5dwAACP1JREFUeF7s011r01AcBvATON8gFCgkV+2AFrKSm5MGCEKlDIqCgEgpXYUaOkanQLrtpupgCxTY8A3EDWToYBNlgFeiIOIX+f/z0pe96IcwSZtRxY0ByXaT3204nIfnPCHXLJFIJBKJgoe8LLyp/+fbPXJ16mvW3k7XsjiOs3xGd+1FoVAn12Hh1g7HqcYqMsdxGAZ0K8B15avOUkGPQymFvm0Plb6InrKOuqEbqoHVd1vPSfxk+fvT/VZRpBQ0aoLPtRW7VptRKD0VGTKcmNva/0biJPmVjDZUtXN8egKBXIM3IeC64NEohHlGvV6WxOcTj4hHhmq015dHyASh0ciXSKjUhAka5in21AMSi0ev3v7UEfEEjM5Rtbd+mPssSeQfz8JEIgZoR7VIHB6ubFvj4WqQ4xvnTqIkgE+j6KPQiSHOe54vlx0Krj38BYJ08bp27UUAcZyHQibiOJIsV9DXV4a1mrKYk8jFSndn+qCJwXuJZmYt2mKy6HvyemlJ8Zd7iSO3Bx8ANKCITDONQpTVtNCzam2vfHVBOK+OvLek/FRpmy4ABWBIob0X5TsF1Th6FY/NHC9NN5BOzadvzg5m06ldmGiSiQYAOCYwBpmNHyQaX+QW+ljbPDjkH5CJheCnnx+MDZU7j+FMcyqOSDU0Ye5jNL1UshhwaNvwo4SK4mYqNQjZGvzl/lkck1GKsPz7xiUu+0Nq2b+2VYVx/NDZJTYmnV2TpuvMsiJNhbSUZmMwSpssENJl7XSmrrDNpkpn3dqO4eraoqXFMmddBWcVncImDpgOMKiiImJu3t+Wl9a54UiccOxA8keY+5xzc25ugiTx+9s5fHL55D7nPM9dk5FY6NpO1wVgJ8g0pVIpv793mWLP31JEeiMKiCa5yeu8CRIeP8STySzLIMv5VSrl+e1YLne0Ap3BMMcnNE/XdV5Ybyer+lcOZyGeIsyKn+AxSDR8qcVwq9X6Lj+sDuwlm8FMJsiJ4o2fSX9fyeeXuY2D6MrpvDz1KEtylmIG/uh2Y6ZDlOomGxBaxx86CzovybniRG12VEEMUaCXLGV03svSPPaMXsBG8jKCDssHc3aE1BgLOj9OCzoshoYKdExxYL3zpTpuODZbo6+f7hKw0A5e5sBDqQ63MGcfwkxnHZXqeL+pQEd7kbpLdY5kwebt0f1HeGwbwYy8zsGMC7Ain9UfmE5va32pDqfXVuCjCwB73Vys0wUy+0f3fV6EeWLqkRn0U13QR9MTEOql4HXI5nZE304Ilo2E6KmkWnYCh9eKdMhI2LpxwU2xaYp10lZsdWKsbj138klVD/X55Q+Mnc/mOyC0bKLjvf3c4sBJB7mX8ekKdCb0rFpMh7ThrcPCNJhRK9kVrG/txkKGkMvHQe48wOpdu1dop6Q6j6N8Glxs8R9pgNAyXDSLdIJZyE4B+zkWS4QE7Fw33oyRYKxGyEWLYVTXmz/5jn+kGY0FRQYT8kp0tJPNfDb6AI6bpDrURtt/U6PRzArYTX5IaXZo+NzDGI+g99NE5/ivu5ebIbKxv1rEBhXpmL6F0yYn1YrqpDpjFHsHsCaKJUR9JwI66Dp5cY2fHaL3SZ75p3qd1QV4yLSDlkEr0mE2XcYQYF9RbHyzSMeaR66SpnS6GcmFrvzIVq2OthMgn9YyTP6cSawj2LhPJGCnrYAlxTrOeoROXSKH52umc2FfVTqsCFE9QgagAw6RztNuavNG8i7s5DE9wSIiHesuNNONP/ZKdFS5RXm1Oqtwo8KDhbGun0DIRXUKNlNGKab8HXRo8x5xYkyP8m1LQWcAVauj1QEz/AVC5jOkDHbk7mAzi9hsklr1ibAk04GBOksb4by2y8bRn1elw2rFqWACwLwOda6/WqTjXpnCyR6GGQAL7FWfuspuFk7aomRK9L+40lKzzhwUIQBNfzAOvOpgRqxzaOVvjCMi7HJc6N91gs7DE+M+OrWW9mSequ3tsFo19svymWwjFdlT0OF3dRGFIpkog1kEnZag0hfmSO4YX9u6UrOOqYcrSWic6LB4H5TDHENwdooSMB6/AfepNh2olTTpEh1jOUyJS3QCCU/uygCqUQfmeGmGz0p0wvfLYjGpTih9/ti1F1CtOvCVU5qwR/KZd7etLDbbIcHaz+euIVS7jiPAlYsKziiLr688tsSwhU877tu+XDyK/ofOxIZMHH3KD4m0D6q2QVpINu4p8lHyiQCRUCh6lYb2tUkZRJdI+5v+fCs38BGCyGgQaofHqC7DtrD4tx07aGkbDAM4/hTmB5gFhqAILAFs0SHYpqaMwkwRhtBWtmp0FobFURqw1uJlaQdO6SVMB0zZmNCeelLmbd1p32CXIjj2BNNkZUnyIZa0tKlujAFtveR3ed/b++fhvbwv/JcvDVFDmaSQg7YzSrkhile6MjW3OQQt4Ekkxp/PhsPJmRgDvZQp3mdlXVE4Bdo8tP36pqI0z/MP8d1T6FIdVWeXxEDW9TICPRUXfFwFzRzliZ0T/UnV63XqyhqL5Y77EXR58D5dW/KryUXXIfTY6TzBss2cNTsHdVlOIVIcRSPi3vq1lmNXdrx2guF548NbgJ4PR02lsG7mjEDHKCJP0/wen5hITEK3Y5crvY1oxRRC0HMHMyparudQ1T0x0SmxTbqzaTTtzhvCaRx6blLwYTtnCv5paHPkbNSKGcuVDCF4BH1QXg50cuzx/GlzZO3iG5nO1jBcNIxCEPpjoyFhE0WSCgd/88IzZ/26kT++tq6MEItAv2yI2u4YoqZpiKR+8x+9ulB+TIiSTHKsjL+aVybGHEH/lEXMhRElUULUFZ1f94DlzfT0gntjJ5kVTX5JRZ0lKyclI8NAX00TGiKqhN9cUmSF06Mpmq7L2wHRxq5UFOXzyetMKA79RgQQ0TycCEgqpnRdJ/NsXkaU8kvnH4fvnSe9Oe9qfnXZ2I/DAHwq5cY0QrT4Ec0d4feLor5y8X14a+vycnExFotlQgwMSkQo+cRWD2EuLTve3LIh7L86fAaDFr/rbRgzXsuOz+fzFnNFo3AQZODWMJmCYdsPReDWMXEm2NTd4nA4HA6H4zc5mbo+QO8AVQAAAABJRU5ErkJggg==');\n    background-size: 100%;\n    background-repeat: no-repeat;\n    padding-top: 58.45%; /* aspect ratio of the background image */\n}\n\n.aladin-col {\n    float: left;\n    width: 45.00%;\n    margin-right: 5.0%;\n}\n  /* Clear floats after the columns */\n.aladin-row:after {\n    content: \"\";\n    display: table;\n    clear: both;\n }\n\n.aladin-location {\n\tz-index: 20;\n\tposition:absolute;\n    top: 0px;\n\tpadding: 2px 4px 2px 4px;\n\tbackground-color: rgba(255, 255, 255, 0.5);\n\tfont-size: 11px;\n}\n\n.aladin-projSelection {\n\tz-index: 20;\n\tposition:absolute;\n    top: 0px;\n    right: 48px;\n\tpadding: 2px 4px 2px 4px;\n\tbackground-color: rgba(255, 255, 255, 0.5);\n\tfont-size: 11px;\n}\n\n.aladin-location-text {\n\tfont-size: 13px;\n    margin-left: 4px;\n}\n\n.aladin-measurement-div {\n\tz-index: 77;\n\tposition:absolute;\n    bottom: 20px;\n\tbackground-color: rgba(255, 255, 255, 0.8);\n    font-family: monospace;\n\tfont-size: 12px;\n    display: none;\n    width: 100%;\n    overflow: auto;\n}\n\n.aladin-measurement-div table {\n\tpadding: 2px 4px 2px 4px;\n    table-layout: fixed;\n    white-space: nowrap;\n}\n\n.aladin-measurement-div thead {\n    background-color: #e0e0e0;\n    color: #000;\n}\n\n.aladin-measurement-div td, .aladin-measurement-div th {\n    /*\n    border-left-color: #cbcbcb;\n    border-left-style: solid;\n    */\n    padding: 0.3em 0.3em;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    text-align: left;\n}\n\n.aladin-marker-measurement {\n    max-height: 130px;\n    overflow-y: auto;\n    overflow-x: hidden;\n    font-family: monospace;\n\tfont-size: 11px;\n    color: #000;\n}\n.aladin-marker-measurement table {\n    table-layout: fixed;\n    width: 100%;\n}\n.aladin-marker-measurement table tr td{\nword-wrap:break-word;\n}\n.aladin-marker-measurement tr:nth-child(even) {\n    background-color: #dddddd;\n}\n.aladin-marker-measurement td:first-child {\n    font-weight: bold;\n}\n\n.aladin-fov {\n    z-index: 20;\n    position: absolute;\n    padding: 0;\n    font-size: 12px;\n    font-weight: bold;\n    bottom: 0px;\n    padding: 2px;\n    color: #321bdf;\n    /*text-shadow: 0 0 1px white, 0 0 1px white, 0 0 1px white, 0 0 1px white, 0 0 1px white;*/\n\tbackground-color: rgba(255, 255, 255, 0.5);\n}\n\n/* maximize/restore size icons */\n.aladin-maximize {\n\tposition: absolute;\n\ttop: 6px;\n\tright: 3px;\n\tz-index: 20;\n\twidth: 30px;\n\theight: 30px;\n\tbackground-image: url('data:image/gif;base64,R0lGODlhFgAWAOMJAAAAAAEBAQICAgMDAwUFBAUFBQcHBwgICAsLCv///////////////////////////yH5BAEKAA8ALAAAAAAWABYAAARm8MlJabr41i0T+CCQcJz3CYMwklsSEAUhspVnHEYw0x1w558VzYQTBXm24sgjJCUQykmT9dzxWlNq9vrwILYtqe/wRc6SBqszOE6DLZ/AT00FyKNcD4wQeLdQAiB+cCFHVxkZXA8RADs=');\n\tbackground-repeat:  no-repeat;\n\tbackground-position:center center;\n}\n\n.aladin-layersControl-container {\n    position: absolute;\n    top: 30px;\n    left: 4px;\n    cursor:pointer;\n    z-index: 20;\n    background: rgba(250, 250, 250, 0.8);\n    border-radius: 4px;\n}\n\n.aladin-layersControl-container:hover {\n\tbackground: rgba(220, 220, 220, 0.8);\n}\n\n.aladin-layersControl {\n\twidth: 32px;\n    height: 34px;\n    background-image: url('data:image/gif;base64,R0lGODlhGQAcAMIAAAAAADQ0NKahocvFxf///wAAAAAAAAAAACH5BAEKAAcALAAAAAAZABwAAANneLoH/hCwyaJ1dDrCuydY1gBfyYUaaZqosq0r+sKxNNP1pe98Hy2OgXBILLZGxWRSBlA6iZjgczrwWa9WIEDA7Xq/R8d3PGaSz97oFs0WYN9wiDZAr9vvYcB9v2fy/3ZqgIN0cYZYCQA7');\n    background-repeat:  no-repeat;\n    background-position:center center;\n}\n\n.aladin-layerBox {\n    top: 30px;\n    padding: 4px 4px;\n    max-height: 90%;\n    overflow-y: auto;\n}\n\n.aladin-box {\n\tdisplay: none;\n    z-index: 30;\n    position: absolute;\n    background: #eee;\n    left: 4px;\n    border-radius: 4px;\n    font-size: 14px;\n    font-family: Verdana, Lucida, Arial;\n    line-height: 1.3;\n    color: #222;\n    padding: 0.8em;\n}\n\n.aladin-dialog {\n\tdisplay: none;\n    z-index: 30;\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n    background: #eee;\n    border-radius: 4px;\n    font-family: Verdana, Lucida, Arial;\n    line-height: 1.3;\n    color: #222;\n    min-width: 300px;\n    max-width: 500px;\n    padding: 0.8em;\n}\n\nselect {\n    padding: 4px;\n}\n\n.aladin-surveySelection {\n    max-width: 230px;\n}\n\ninput[type=text], input[type=number] {\n    padding: 4px;\n    width: 100%;\n    box-sizing: border-box;\n}\n\n.aladin-box-title {\n  font-size: 16px;\n  font-family: Verdana, Lucida, Arial;\n  line-height: 2.0;\n  font-weight: bold;\n  cursor: pointer;\n  border-radius: 4px;\n}\n\n.aladin-box-content {\n  padding: 10px;\n}\n\n.aladin-text {\n  background-color: #bbb;\n}\n\n.aladin-gotoControl-container {\n\tposition: absolute;\n    top: 68px;\n    left: 4px;\n    cursor:pointer;\n    z-index: 20;\n    background: rgba(250, 250, 250, 0.8);\n    border-radius: 4px;\n}\n\n.aladin-gotoControl-container:hover {\n    background: rgba(220, 220, 220, 0.8);\n}\n\n.aladin-gotoControl {\n    width: 32px;\n    height: 34px;\n    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAASZJREFUeNpiYMAOpIG4GogPAPETIP4PpQ9AxaUZyARsQNwFxN+ghuLC36Dq2EgxXBSITxIwGB2fhOojyuXohl8C4hCk4JCG8i9hsYSgT9qRNPwE4hY8mtig8n+Q9LTjM1waaihMcQ6RQZqD5ig5XAobkRQeJjFRHEbS20iMoigSLYgixnHPkRSRmr6lkfQ+x6UIOfzZyMg3yPFAfx8wAfFNJL49iRYgq7+JS1EFlVJRBS5FcmjxkEak4WnE5gMGaMGFrBhUYjLjUMsMlUd21CJyyqLz0LJHAqpGAso/j6XQ+0NMHiKnNEW3JJyQJZzQ4PpJwLCf0GD5Q44l6DXac6R0jl6jhVBiCbEAlyUh9LDEm9aWPGegMkC35AkDDYAf1OUg7AoQYADEj7juEX/HNAAAAABJRU5ErkJggg==');\n    background-repeat:  no-repeat;\n    background-position:center center;\n}\n\n.aladin-gotoBox {\n    top: 68px;\n    padding: 4px;\n}\n\n.aladin-target-form {\n\tpadding: 5px;\n}\n\n\n.aladin-simbadPointerControl-container {\n    position: absolute;\n    top: 106px;\n    left: 4px;\n    cursor:pointer;\n    z-index: 20;\n    background: rgba(250, 250, 250, 0.8);\n    border-radius: 4px;\n}\n\n.aladin-simbadPointerControl-container:hover {\n    background: rgba(220, 220, 220, 0.8);\n}\n\n.aladin-simbadPointerControl {\n\twidth: 32px;\n    height: 34px;\n    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gEIDgUy0LKZuQAABc5JREFUSEuFln9sVeUZxz/P+97TbmtL0pZrO5wtvT/bkolBQ5gJrh1FO9RNTYSEYEoiywjiHBlbssXNP4Y2ziZLlBJ1GBFnWF2CPya0TgxsMytmY8Fk4/bec3sv1AXaXmYyaBvovec8++Oe2xUw25uc5LzvOe/3+fV9fkhPT1eI/y4BdGEjIs03N3kHXz3kiwix5W0/ERF187l+VZW+RzfLhU8njapec28xjiwSsHCoqqy5a7X/9FPP+R3xRNjzvGagRlW3qyrGmBeBWRuyk6lMpvDm8Ovy0sB+KyI3KhkIkDKu4lQ5jAwfK3XEE02lUmmNqm4AuoE41y4XOC4iR23Inhxz3ane3p5QsVgkELQgwKmA1y2p1bcOv+clo7E7fN9/DNga/Pe3ADAW7LOUBa4K9geMMYOZ3PhfH3jwPnv50mWpWGMjkeUGwKly+N27I14iGv2G+joI9AInRORZERmMJ1te/Oxf/24UkVRrZNkPLl2aGRXkE6AGeFBVVzc2NKT/PPpxPpmMG9/3BVDp6ekKqSoffviHUiISvcP3/f3ASmCfDdlfprPZbKAl8bbIkwBuPrencpaMxmKe5+0CdgCnjTHbMrnxU+vWfT0kIhiANXet9jviiabALSuBfdVfqP5pOpvNqmoFKKqqSVVNJqOxCMBvR34t6fFstqq66klgH3Cb7/s72+Pxpke2b/YAZP36bueDD44X422Rb6vq28AJG7LfqWjeEU/cVCwWnwPCwSPAFHDRcZzdKTdTWGTJr4AuEXnAzefeWb++2zHNNzd5HfFEOGALIjJU0TwAHwImjDW7gT8Bf7TW/gg4WywWhzriifC5uTFJj2ezIjIEoKobOpPJcLg57JuDrx7yA553U2bLaCCIQPOPnKrQ85nx8TNAQYRCejz7D6fK2Qt8VCwWB1q/1F7h/WiA0VUqlpreODjkm4BONZRp58YSt/w9MDkKhI01h1IZt7Dh3rtt3ZLaF2pqa57fcO/dNpXJFIw1vwHClZg03XLTGcp0TgC1IqISpH9CVfuAU8BhETGqmgTaKbulULek9oWlTUuvAExfmK6enZl7QkSWqupaYAxII/goDwG3A68BGSMiWmEKcE0WUg4oIkEmLvrnc+6pIFK5A6gIatx8rj+oLQDZlraWX7j53B5r7VPAlLX2FTef71/WsuzK9IXp6sJkofrLX2m+6uZz/caaV4CLNmR/5uZzT7e2tTxL2UUYY1528/n+SiWcDT7EJ85NrABIj2dzwEXP8zZ2JBLho0d+783OzD0xOzP3veHhY6XORCLse/4mYDqdzeYBzuUnVhDEErisqmL6Ht0sNmQngePAKny+BuUkchxnN7C2OF98PBGNdgY+Dyei0RXz88XHgbWO4/xwkavupFyfTlhrp7Zu2yLmwqeTJpXJFETkKICqbkxGY7GHe7doys0UHMfZBLT6nj8QBHSt7/kDQKvjOJtSbmZaREhGYzFV3QggIkdSbqZwfuK8Maoqbw6/LjZkTwIHgG7P83Z1JpP1ACOfvHsxezbfZ63dScAWG7I7smfzfWcy6WmAFe3t9Z7nfR/oAg7YkD05MPiMqKoYQF8a2G/HXHfKGDMInAZ2zF+d35OMxmKVJApikhaRVMXnFc2vXrn6c+AxysVu75jrTg0ffj8EqI1ElhsRIZGImY//cuqfjQ0NaZTbgPtV9dbG+oYvNtbXFztvTX42c2n2TkFk1aqVoxbz1cb6+od83/8xsBE4LSK73Hxu9J7edaFKXBY6mqpq3ZI6ffut97xEJHq77/s7+fyGI8H79Q1nbyY3fur+b30zNDc7t5BPCx0Nyr3YcRxGRo6V2uPxJq/k/b+WeUJEjlRa5j2960KlYmlxsopcN1VAYM0j2zd7Wx/+rnYmk+FSsdQM1Pi+vx1QY8zLwGVr7VTKzRQGBp+R4cPvh0TkhsniegE3jC3h5rD/xsEhX0S0XLdQN5/vV1XZum2LnJ84/z/Hlv8AT3rLVQaE2oEAAAAASUVORK5CYII=');\n    background-repeat:  no-repeat;\n    background-position:center center;\n}\n\n.aladin-shareControl-container {\n    position: absolute;\n    bottom: 30px;\n    left: 4px;\n    cursor:pointer;\n    z-index: 20;\n    background: rgba(250, 250, 250, 0.8);\n    border-radius: 4px;\n}\n\n.aladin-shareControl-container:hover {\n    background: rgba(220, 220, 220, 0.8);\n}\n\n.aladin-shareControl {\n\twidth: 32px;\n    height: 34px;\n    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAA/1BMVEUAAAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzP////6PkQMAAAAU3RSTlMAAAI2l9TiyXwcBmrj/cEvePX69MD+Vzl06Px5sMgDZPsbOwUfKFGAHVjSEkBgXTcMllbG8rbhdtcm26Ko5/M8F3clPqN1JK+usRpVQdNQBGN9OkYs7f8AAAABYktHRFTkA4ilAAAACXBIWXMAARCQAAEQkAGJrNK4AAABMUlEQVQoz13SeVuCQBAGcAYV5TREEpUQr9TMK9G8Nc/usvn+36VdRFDmz9/uwzuzA8NcFrCRaIyLJ3iAaxdECUnJShKu/UZFTGkyYpoPu67cZows5hKXnif3TfJ5MHS8C9wqcDaaRRILJQ254KBcqd7X6tShYePDmaH52Gp3uq7zacTe+fpTnwQ7gwxJKJqIw4iX++ygW6Ox66oIQf+T6WyOi+WK+osAvptri91sd/tDyF/3u+2GtdZvIT+slgucz6YT3xkQqb/DeHSKd3YnZzpD1wEyA0dHtf9R9h62R5/Snavbabc+m/4mvtBuuF6vfVcrP8EeONRK1MlcNvdrBQdx1A2SwNO58sLF4o45zBp/DUX3+/SKV8iOtRSGnYGkItP+JVEI/RnAH+NSLBphr/0f6ns3OQ1Zz7kAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTMtMTEtMThUMTQ6MzM6NTUrMDE6MDCINg3ZAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDEzLTExLTE4VDE0OjMzOjA0KzAxOjAwF/ywtQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=');\n    background-repeat:  no-repeat;\n    background-position:center center;\n}\n\n.aladin-shareBox {\n    bottom: 30px;\n    padding: 4px;\n}\n\n.aladin-shareInput {\n    width: 300px;\n    margin-top: 10px;\n    display: block;\n}\n\n.aladin-target-form input {\n\twidth: 140px;\n\tmargin-left: 5px;\n}\n\t\n\n\n\n.aladin-cb-list ul {\n    margin: 0;\n    padding-left: 4px;\n    list-style: none;\n}\n\n.aladin-cb-list label {\n\tdisplay: inline;\n}\n\n.aladin-cb-list input[type=\"checkbox\"] {\n    margin: 3px;\n}\n\n.aladin-closeBtn {\n\tfloat:right;\n    margin-top: 0 0 2px 0;\n    cursor:pointer;\n    color: #605F61;\n    border: 1px solid #AEAEAE;\n    border-radius: 3px;\n    background: #fff;\n    font-size: 15px;\n    font-weight: bold;\n    display: inline-block;\n    line-height: 0px;\n    padding: 8px 2px;       \n}\n\n.aladin-closeBtn:hover {\n\tcolor: #201F21;\n}\n\n.aladin-label {\n\tfont-weight: bold;\n\tpadding-bottom: 4px;\n}\n\n.aladin-box-separator {\n\theight: 0;\n    border-top: 1px solid #bbb  ;\n    margin: 5px 0px 5px -4px;\n}\n\n.aladin-blank-separator {\n\theight: 10px;\n}\n\n.aladin-restore {\n\tposition: absolute;\n    top: 6px;\n    right: 3px;\n    z-index: 20;\n    width: 30px;\n    height: 30px;\n    background-image: url('data:image/gif;base64,R0lGODlhFgAWAOMJAAAAAAEBAQICAgMDAwUFBAUFBQcHBwgICAsLCv///////////////////////////yH5BAEKAA8ALAAAAAAWABYAAARk8MlJ60zJapsAyhsFPp1xfKHUZeVhAOPWwYD5xjIABDacXrseLtQhFAiBIVEwEOh8P9VzquRgrhgrNhudTaHdJ1NQ1SQCRgL41zIE1sSa6w0361y0eqXtW7EReCNlIgh6XYMbEQA7');\n    background-repeat:  no-repeat;\n    background-position:center center;\n}\n\n.aladin-fullscreen {\n\tposition: fixed !important;\n\tz-index: 9999;\n\ttop: 0;\n\tleft: 0;\n\theight: 100% !important;\n\twidth: 100% !important;\n\tborder: 0 !important;\n    max-width: none !important;\n    background: #fff; /* allows to hide all HTML elements in the background */\n}\n\n.aladin-zoomControl {\n\tz-index: 20;\n\tposition:absolute;\n\ttop: 50%;\n\theight: 48px;\n\tright: 8px;\n\tpadding: 0;\n\tmargin: -24px 0 0 0;\n\tfont-weight: bold;\n\tfont-size: 18px;\n\tfont-family: Verdana, Lucida, Arial;\n}\n\n\n.aladin-zoomControl a {\n\twidth: 20px;\n\theight:20px;\n\tline-height: 18px;\n\tdisplay:block;\n\tbackground-color:rgba(250, 250, 250, 0.8);\n\tmargin:1px;\n\ttext-align:center;\n\tborder-radius:4px;\n\tborder:1px solid #aaa;\n\ttext-decoration:none;\n\tcolor:#222;\n}\n\n.aladin-zoomControl a:hover {\n\tbackground-color: rgba(220, 220, 220, 0.8);\n}\n\n.aladin-cmSelection {\n    width: 60px;\n    margin-right: 10px;\n}\n\n.aladin-btn {\n\tdisplay: inline-block;\n    padding: 6px 8px;\n    margin-bottom: 0;\n    font-size: 12px;\n    font-weight: normal;\n    text-align: center;\n    white-space: nowrap;\n    vertical-align: middle;\n    cursor: pointer;\n    border: 1px solid transparent;\n    border-radius: 3px;\n    color: #ffffff;\n    background-color: #428bca;\n    border-color: #357ebd;\n    margin-right: 4px;\n}\n\n.aladin-cancelBtn {\n    background-color: #ca4242;\n    border-color: #bd3935;\n}\n\n.aladin-frame {\n    border: 1px solid transparent;\n    border-color: #aaa;\n    padding: 4px 4px 4px 4px;\n}\n\n.aladin-box-content > div {\n    margin: 10px 0px 0px 0px;\n}\n\n.aladin-btn-small {\n\tdisplay: inline-block;\n    border-radius: 3px;\n    margin-bottom: 0;\n    padding: 0;\n    vertical-align: middle;\n    cursor: pointer;\n    border: 1px solid transparent;\n    color: #ffffff;\n    font-size: 14px;\n    background-color: #428bca;\n    border-color: #357ebd;\n    margin-left: 2px;\n    min-width: 1.5em;\n    min-height: 1.5em;\n}\n\n.aladin-button:hover {\n\tcolor: #ffffff;\n    background-color: #3276b1;\n    border-color: #285e8e;\n}\n\n.aladin-unknownObject {\n\tborder: 3px solid red;\n}\n    \n.aladin-popup-container {\n\tz-index: 25;\n\tposition: absolute;\n    width: 200px;\n    display: none;\n    line-height: 1.3;\n}\n\n.aladin-popup {\n\tfont-family: Verdana, Lucida, Arial;\n    font-size: 13px;\n    background: white;\n    border: 1px solid #bbb;\n    border-radius: 4px;\n    padding: 4px;\n    top: 80px;\n    left: 110px;\n}\n\n\n.aladin-popup-arrow {\n    display: block;\n    border-color: #fff transparent transparent;\n    border-style: solid;\n    border-width: 12px;\n    width: 0px;\n    height: 0px;\n    margin-top: -1px;\n    margin-left: auto;\n    margin-right: auto;\n/*\n    width: 15px;\n    height: 15px;\n    background: white;\n    margin: -12px 94px;\n    padding-bottom: 10px;\n    overflow: hidden;\n    -webkit-transform: rotate(45deg);\n       -moz-transform: rotate(45deg);\n        -ms-transform: rotate(45deg);\n         -o-transform: rotate(45deg);\n            transform: rotate(45deg);\n*/\n}\n\n\n.aladin-popupTitle {\n    font-weight: bold;\n}\n\n.aladin-popupText {\n}\n\n.aladin-options {\n    margin-top: 4px;\n}\n\n.aladin-layer-label {\n\tpadding: 0 4px 0 4px;\n\tcolor: #ddd;\n    border-bottom-left-radius:  8px;\n    border-top-left-radius:     8px;\n    border-bottom-right-radius: 8px;\n    border-top-right-radius:    8px;\n    cursor: pointer;\n    user-select: none;\n}\n\n.aladin-sp-title a {\n    text-decoration: none;\n    color: #317d8d;\n}\n\n.aladin-sp-content {\n    font-size: 12px;\n}\n\n.aladin-sp-content a {\n    text-decoration: none;\n    color: #478ade;\n    font-size: 11px;\n}\n\n.aladin-cuts {\n    width: 8em;\n}\n\n.add-layer-hips {\n    margin-top: 0.2em;\n}\n\n\n/* Icons figuring layers in the Stack */\n.aladin-stack-icon {\n\twidth: 16px;\n    height: 16px;\n    background-repeat:  no-repeat;\n    background-position:center center;\n    display: inline-block;\n    vertical-align: text-top;\n}\n\n\n\n.aladin-chevron {\n  display: inline-block;\n  width: 16px;\n  height: 16px;\n  cursor: pointer;\n  vertical-align: middle;\n  background: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDQ0IDQ0IiBzdHJva2U9IiM0NDQiIGJhY2tncm91bmQtY29sb3I9ImJsdWUiPgoKICAgIDxyZWN0IHg9IjIiIHk9IjIiIGhlaWdodD0iNDAiIHdpZHRoPSI0MCIgZmlsbD0idHJhbnNwYXJlbnQiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPgogICAgPHBhdGggZD0iTTEwIDEzIEwyMiAyMSBMMzQgMTMiIGZpbGw9InRyYW5zcGFyZW50IiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPiAKICAgIDxwYXRoIGQ9Ik05IDI1IEwyMiAzMyBMMzUgMjUiIGZpbGw9InRyYW5zcGFyZW50IiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPiAKCjwvc3ZnPgo=') no-repeat;\n}\n.aladin-chevron-down {\n  transform: rotate(0deg);\n}\n.aladin-chevron-left {\n  transform: rotate(90deg);\n}\n.aladin-chevron-up {\n  transform: rotate(180deg);\n}\n.aladin-chevron-right {\n  transform: rotate(270deg);\n}\n\n.indicator {\n    font-family: monospace;\n    cursor: pointer;\n}\n\n.right-triangle:before {\n    content: '\\25b6';\n}\n\n.down-triangle:before {\n    content: '\\25bc';\n}\n\n\n/* *********************************************** */\n\n/* Cursors */\n\n/* Simbad pointer cursor */\n.aladin-sp-cursor {\n    cursor: auto;\n    cursor: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gEIEwUMBS20MQAAApRJREFUWEfdV7GO2zAMfXY7x1luzOFwDeB/KHCAB87eumvqmI/JWhTwF3TIrMFAv8JbgWyHG3IpOjbpcKJC02KipECHclIU+j2KfKRlAABRUyFYak3UgKiZiXUJAIt1d1ysu2PYn53DsPCucpbkRE3JAdxKTtQgWo6zJAfGGbAwLuEV7OB9/yrXIbqZ9/0+rMuhdb+RYfWmm+fged8fihzyoXXxlNcYB2KRxwwA6SzI9Crgd973B/5/u3IF8FYSw98M5D2QR86kRE3pfX+AMqKm8iEQoqYaWrfj/4bW7QgokMhCeSs5KeVrDM4K29C6Y6oE0YGEUlndocVGyg/rGZDXBQpr0kmjLiAlOOvk3vf7RJZM5Q+te2W/7coVEq+wnC1yCZYyS3B8MMYF3vBKK9Jz5PWmm8sab1eu4N9D63aaHEAsH88SzmQpnSHsHDmnWvlXIoiJ4JTviY8FRUJ8ZAiOEiJbLpcjARM1M0twpmjZOeGQrXYm1/7yMLz/eH8fnyus6XXOtmLgWBrKtdMguNKYPPystIausn9egsVDfI674KxS6003F/sX357AdOBwcADwWD9EjBKJubxYd0cml4RhP5IPrduFk04GjiZXMyZiRHKdAU3OWeB2lLNAk+tpl9IHY0zSlBo4OgsaTJpFzs+F0pxKYEXK73Nd8+3KFfWmG71qGfgSeQqPN0fvdlZrSvmUoXaJJ7EiocArZaS6tgzA+5RQe3gumUl5gPLXzy+6pEQNzDuhvFKx1ZuuEuTxliwmY/KuoHxGhzGv5QDw9PTx7senz88aLHUpJeOu8OHb17u+//4CTMm97/eFVQK5vqR8y6xOyipByjn3+0C3moUH4O++D1UX3PR9eJWzJCf6Tz5O/wDUeIfTLPlbywAAAABJRU5ErkJggg==') 15 15, auto;\n}\n\n/* *********************************************** */\n\n/* Autocomplete styles (adapted from https://github.com/kraaden/autocomplete ) */\n.autocomplete {\n    background: white;\n    z-index: 20000;\n    font: 14px/22px \"-apple-system\", BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n    overflow: auto;\n    box-sizing: border-box;\n    border: 1px solid rgba(50, 50, 50, 0.6);\n}\n\n.autocomplete * {\n    font: inherit;\n}\n\n.autocomplete > div {\n    padding: 0 4px;\n}\n\n.autocomplete .group {\n    background: #eee;\n}\n\n.autocomplete > div:hover:not(.group),\n.autocomplete > div.selected {\n    background: #81ca91;\n    cursor: pointer;\n}\n",
        "",
        {
          version: 3,
          sources: ["webpack://./src/css/aladin.css"],
          names: [],
          mappings:
            "AAAA;CACC,kBAAkB;CAClB,sBAAsB;IACnB,YAAY;IACZ,oBAAoB;AACxB;;;AAGA;CACC,kBAAkB;IACf,UAAU;CACb,OAAO;CACP,MAAM;AACP;;AAEA;IACI,kBAAkB;IAClB,UAAU;IACV,OAAO;IACP,MAAM;AACV;;AAEA;IACI,kBAAkB;CACrB,WAAW;IACR,UAAU;CACb,WAAW;;IAER,eAAe;IACf,eAAe;AACnB;;AAEA;IACI,UAAU;CACb,uXAAuX;IACpX,qBAAqB;IACrB,4BAA4B;IAC5B,iBAAiB,EAAE,yCAAyC;AAChE;;AAEA;IACI,UAAU;IACV,00IAA00I;IAC10I,qBAAqB;IACrB,4BAA4B;IAC5B,mBAAmB,EAAE,yCAAyC;AAClE;;AAEA;IACI,WAAW;IACX,aAAa;IACb,kBAAkB;AACtB;EACE,mCAAmC;AACrC;IACI,WAAW;IACX,cAAc;IACd,WAAW;CACd;;AAED;CACC,WAAW;CACX,iBAAiB;IACd,QAAQ;CACX,wBAAwB;CACxB,0CAA0C;CAC1C,eAAe;AAChB;;AAEA;CACC,WAAW;CACX,iBAAiB;IACd,QAAQ;IACR,WAAW;CACd,wBAAwB;CACxB,0CAA0C;CAC1C,eAAe;AAChB;;AAEA;CACC,eAAe;IACZ,gBAAgB;AACpB;;AAEA;CACC,WAAW;CACX,iBAAiB;IACd,YAAY;CACf,0CAA0C;IACvC,sBAAsB;CACzB,eAAe;IACZ,aAAa;IACb,WAAW;IACX,cAAc;AAClB;;AAEA;CACC,wBAAwB;IACrB,mBAAmB;IACnB,mBAAmB;AACvB;;AAEA;IACI,yBAAyB;IACzB,WAAW;AACf;;AAEA;IACI;;;KAGC;IACD,oBAAoB;IACpB,mBAAmB;IACnB,gBAAgB;IAChB,uBAAuB;IACvB,gBAAgB;AACpB;;AAEA;IACI,iBAAiB;IACjB,gBAAgB;IAChB,kBAAkB;IAClB,sBAAsB;CACzB,eAAe;IACZ,WAAW;AACf;AACA;IACI,mBAAmB;IACnB,WAAW;AACf;AACA;AACA,oBAAoB;AACpB;AACA;IACI,yBAAyB;AAC7B;AACA;IACI,iBAAiB;AACrB;;AAEA;IACI,WAAW;IACX,kBAAkB;IAClB,UAAU;IACV,eAAe;IACf,iBAAiB;IACjB,WAAW;IACX,YAAY;IACZ,cAAc;IACd,0FAA0F;CAC7F,0CAA0C;AAC3C;;AAEA,gCAAgC;AAChC;CACC,kBAAkB;CAClB,QAAQ;CACR,UAAU;CACV,WAAW;CACX,WAAW;CACX,YAAY;CACZ,uSAAuS;CACvS,6BAA6B;CAC7B,iCAAiC;AAClC;;AAEA;IACI,kBAAkB;IAClB,SAAS;IACT,SAAS;IACT,cAAc;IACd,WAAW;IACX,oCAAoC;IACpC,kBAAkB;AACtB;;AAEA;CACC,oCAAoC;AACrC;;AAEA;CACC,WAAW;IACR,YAAY;IACZ,uQAAuQ;IACvQ,6BAA6B;IAC7B,iCAAiC;AACrC;;AAEA;IACI,SAAS;IACT,gBAAgB;IAChB,eAAe;IACf,gBAAgB;AACpB;;AAEA;CACC,aAAa;IACV,WAAW;IACX,kBAAkB;IAClB,gBAAgB;IAChB,SAAS;IACT,kBAAkB;IAClB,eAAe;IACf,mCAAmC;IACnC,gBAAgB;IAChB,WAAW;IACX,cAAc;AAClB;;AAEA;CACC,aAAa;IACV,WAAW;IACX,kBAAkB;IAClB,QAAQ;IACR,SAAS;IACT,gCAAgC;IAChC,gBAAgB;IAChB,kBAAkB;IAClB,mCAAmC;IACnC,gBAAgB;IAChB,WAAW;IACX,gBAAgB;IAChB,gBAAgB;IAChB,cAAc;AAClB;;AAEA;IACI,YAAY;AAChB;;AAEA;IACI,gBAAgB;AACpB;;AAEA;IACI,YAAY;IACZ,WAAW;IACX,sBAAsB;AAC1B;;AAEA;EACE,eAAe;EACf,mCAAmC;EACnC,gBAAgB;EAChB,iBAAiB;EACjB,eAAe;EACf,kBAAkB;AACpB;;AAEA;EACE,aAAa;AACf;;AAEA;EACE,sBAAsB;AACxB;;AAEA;CACC,kBAAkB;IACf,SAAS;IACT,SAAS;IACT,cAAc;IACd,WAAW;IACX,oCAAoC;IACpC,kBAAkB;AACtB;;AAEA;IACI,oCAAoC;AACxC;;AAEA;IACI,WAAW;IACX,YAAY;IACZ,ujBAAujB;IACvjB,6BAA6B;IAC7B,iCAAiC;AACrC;;AAEA;IACI,SAAS;IACT,YAAY;AAChB;;AAEA;CACC,YAAY;AACb;;;AAGA;IACI,kBAAkB;IAClB,UAAU;IACV,SAAS;IACT,cAAc;IACd,WAAW;IACX,oCAAoC;IACpC,kBAAkB;AACtB;;AAEA;IACI,oCAAoC;AACxC;;AAEA;CACC,WAAW;IACR,YAAY;IACZ,uoEAAuoE;IACvoE,6BAA6B;IAC7B,iCAAiC;AACrC;;AAEA;IACI,kBAAkB;IAClB,YAAY;IACZ,SAAS;IACT,cAAc;IACd,WAAW;IACX,oCAAoC;IACpC,kBAAkB;AACtB;;AAEA;IACI,oCAAoC;AACxC;;AAEA;CACC,WAAW;IACR,YAAY;IACZ,uyCAAuyC;IACvyC,6BAA6B;IAC7B,iCAAiC;AACrC;;AAEA;IACI,YAAY;IACZ,YAAY;AAChB;;AAEA;IACI,YAAY;IACZ,gBAAgB;IAChB,cAAc;AAClB;;AAEA;CACC,YAAY;CACZ,gBAAgB;AACjB;;;;;AAKA;IACI,SAAS;IACT,iBAAiB;IACjB,gBAAgB;AACpB;;AAEA;CACC,eAAe;AAChB;;AAEA;IACI,WAAW;AACf;;AAEA;CACC,WAAW;IACR,qBAAqB;IACrB,cAAc;IACd,cAAc;IACd,yBAAyB;IACzB,kBAAkB;IAClB,gBAAgB;IAChB,eAAe;IACf,iBAAiB;IACjB,qBAAqB;IACrB,gBAAgB;IAChB,gBAAgB;AACpB;;AAEA;CACC,cAAc;AACf;;AAEA;CACC,iBAAiB;CACjB,mBAAmB;AACpB;;AAEA;CACC,SAAS;IACN,4BAA4B;IAC5B,wBAAwB;AAC5B;;AAEA;CACC,YAAY;AACb;;AAEA;CACC,kBAAkB;IACf,QAAQ;IACR,UAAU;IACV,WAAW;IACX,WAAW;IACX,YAAY;IACZ,mSAAmS;IACnS,6BAA6B;IAC7B,iCAAiC;AACrC;;AAEA;CACC,0BAA0B;CAC1B,aAAa;CACb,MAAM;CACN,OAAO;CACP,uBAAuB;CACvB,sBAAsB;CACtB,oBAAoB;IACjB,0BAA0B;IAC1B,gBAAgB,EAAE,uDAAuD;AAC7E;;AAEA;CACC,WAAW;CACX,iBAAiB;CACjB,QAAQ;CACR,YAAY;CACZ,UAAU;CACV,UAAU;CACV,mBAAmB;CACnB,iBAAiB;CACjB,eAAe;CACf,mCAAmC;AACpC;;;AAGA;CACC,WAAW;CACX,WAAW;CACX,iBAAiB;CACjB,aAAa;CACb,yCAAyC;CACzC,UAAU;CACV,iBAAiB;CACjB,iBAAiB;CACjB,qBAAqB;CACrB,oBAAoB;CACpB,UAAU;AACX;;AAEA;CACC,0CAA0C;AAC3C;;AAEA;IACI,WAAW;IACX,kBAAkB;AACtB;;AAEA;CACC,qBAAqB;IAClB,gBAAgB;IAChB,gBAAgB;IAChB,eAAe;IACf,mBAAmB;IACnB,kBAAkB;IAClB,mBAAmB;IACnB,sBAAsB;IACtB,eAAe;IACf,6BAA6B;IAC7B,kBAAkB;IAClB,cAAc;IACd,yBAAyB;IACzB,qBAAqB;IACrB,iBAAiB;AACrB;;AAEA;IACI,yBAAyB;IACzB,qBAAqB;AACzB;;AAEA;IACI,6BAA6B;IAC7B,kBAAkB;IAClB,wBAAwB;AAC5B;;AAEA;IACI,wBAAwB;AAC5B;;AAEA;CACC,qBAAqB;IAClB,kBAAkB;IAClB,gBAAgB;IAChB,UAAU;IACV,sBAAsB;IACtB,eAAe;IACf,6BAA6B;IAC7B,cAAc;IACd,eAAe;IACf,yBAAyB;IACzB,qBAAqB;IACrB,gBAAgB;IAChB,gBAAgB;IAChB,iBAAiB;AACrB;;AAEA;CACC,cAAc;IACX,yBAAyB;IACzB,qBAAqB;AACzB;;AAEA;CACC,qBAAqB;AACtB;;AAEA;CACC,WAAW;CACX,kBAAkB;IACf,YAAY;IACZ,aAAa;IACb,gBAAgB;AACpB;;AAEA;CACC,mCAAmC;IAChC,eAAe;IACf,iBAAiB;IACjB,sBAAsB;IACtB,kBAAkB;IAClB,YAAY;IACZ,SAAS;IACT,WAAW;AACf;;;AAGA;IACI,cAAc;IACd,0CAA0C;IAC1C,mBAAmB;IACnB,kBAAkB;IAClB,UAAU;IACV,WAAW;IACX,gBAAgB;IAChB,iBAAiB;IACjB,kBAAkB;AACtB;;;;;;;;;;;;CAYC;AACD;;;AAGA;IACI,iBAAiB;AACrB;;AAEA;AACA;;AAEA;IACI,eAAe;AACnB;;AAEA;CACC,oBAAoB;CACpB,WAAW;IACR,+BAA+B;IAC/B,+BAA+B;IAC/B,+BAA+B;IAC/B,+BAA+B;IAC/B,eAAe;IACf,iBAAiB;AACrB;;AAEA;IACI,qBAAqB;IACrB,cAAc;AAClB;;AAEA;IACI,eAAe;AACnB;;AAEA;IACI,qBAAqB;IACrB,cAAc;IACd,eAAe;AACnB;;AAEA;IACI,UAAU;AACd;;AAEA;IACI,iBAAiB;AACrB;;;AAGA,uCAAuC;AACvC;CACC,WAAW;IACR,YAAY;IACZ,6BAA6B;IAC7B,iCAAiC;IACjC,qBAAqB;IACrB,wBAAwB;AAC5B;;;;AAIA;EACE,qBAAqB;EACrB,WAAW;EACX,YAAY;EACZ,eAAe;EACf,sBAAsB;EACtB,mwBAAmwB;AACrwB;AACA;EACE,uBAAuB;AACzB;AACA;EACE,wBAAwB;AAC1B;AACA;EACE,yBAAyB;AAC3B;AACA;EACE,yBAAyB;AAC3B;;AAEA;IACI,sBAAsB;IACtB,eAAe;AACnB;;AAEA;IACI,gBAAgB;AACpB;;AAEA;IACI,gBAAgB;AACpB;;;AAGA,oDAAoD;;AAEpD,YAAY;;AAEZ,0BAA0B;AAC1B;IACI,YAAY;IACZ,6jCAA6jC;AACjkC;;AAEA,oDAAoD;;AAEpD,gFAAgF;AAChF;IACI,iBAAiB;IACjB,cAAc;IACd,4GAA4G;IAC5G,cAAc;IACd,sBAAsB;IACtB,uCAAuC;AAC3C;;AAEA;IACI,aAAa;AACjB;;AAEA;IACI,cAAc;AAClB;;AAEA;IACI,gBAAgB;AACpB;;AAEA;;IAEI,mBAAmB;IACnB,eAAe;AACnB",
          sourcesContent: [
            ".aladin-container {\n\tposition: relative;\n\tborder: 1px solid #ddd;\n    height: 100%;\n    /*overflow: hidden;*/\n}\n\n\n.aladin-imageCanvas {\n\tposition: absolute;\n    z-index: 1;\n\tleft: 0;\n\ttop: 0;\n}\n\n.aladin-catalogCanvas {\n    position: absolute;\n    z-index: 2;\n    left: 0;\n    top: 0;\n}\n\n.aladin-logo-container {\n    position: absolute;\n\tbottom: 2px;\n    right: 5px;\n\tz-index: 20;\n\n    min-width: 32px;\n    max-width: 90px;\n}\n\n.aladin-logo-small {\n    padding: 0;\n\tbackground: url(data:image/gif;base64,R0lGODlhIAAgAJEAAJIsLdEwJAdMmP///yH5BAkAAAMALAAAAAAgACAAAAjMAAcIHEiwoMGDCBMqXMiwocOHECMaFCCxYkKKAAoK2MiRo0UBAEKKFOkxYUaCIEMSHBlyo0OQCke6HHDyJEWBKgcG2MlzoEyFMAXyHNqTZsubNFGeHLDT4FCcLREGZUqwaFGRUk82FfqUaQCoSH0OCLqVqlCuX42u9Kl1a1qzXnGGVaozLdG6cpMWxOrVblm4AOYOTNn2L1efYZdu5Eu0cV6cE0fW7QqV4WK+CAMLPnhZMtvAEDmy/CkWMtCOHVFaXC2VtevXsGPLZhgQADs=);\n    background-size: 100%;\n    background-repeat: no-repeat;\n    padding-top: 100%; /* aspect ratio of the background image */\n}\n\n.aladin-logo-large {\n    padding: 0;\n    background:  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI4AAABTCAMAAAB+g8/LAAACx1BMVEVMaXGBYYSWk5i7ur1fGUW0Fzbi4OP////Qz9K2s7f////qyseffX7TxczMytBXU1ndrahOWXi0o7RaH0v///+1GjfYkY29srb///+1GTe0Fzajn6RgFkFdHkni3+GLV3PU0dXMubr6+vpmIktUJVKiGDqGcX7p5ujLwMJgFkFgFkFNOWnp1tZaHUi0FzaEZohkX2VVKVXUwcvy8vI4U4tQMWBXIk+NGT9ZIEx+Wn5vF0EUYqF3c3lgFkL5+PkUYqH///////9lFkG0FzYUYqFeNF/BwMs2WpP6+vrBv8JSJ1TNy85TJlO0FzaJhYsUYqF5GEEUYqF2Zo60FzazFza0FzYUYqGWdIsrWpWTGj6jGDp3Kk58Y4S0FzZgFkFXIU2OiY+vmqVhGENlGEJqQ2z///9SKFJTJlP///9pF0GOjpd0Ol6rFzi9sbm0Fza0FzYUYqGXmLp3TXJmHkhLSXy/jJBVK1ivrLDu7e7l5OYLCw6AYYRpFkGCIUYVYqGAZoqJfofez9hZPGtcW4phFkIUYqGVbG1BToTFw8ZqZGr4+PmIGkAWYqD6+vpaHUoUYqGEZoh5ZH2ceYAbGyCmFzmgGjsUYqGAYIOuiJJ3SW1PZJlNM0OliJ+MQF5uF0Gcmp8kXZpSKFWEZojDwcXq1tQzVY9pN2CyFzbZlZFHbKOZgpWjnaRlMlsUYqGHGD9FRElaHUiZfpfW1dddW2HMtsJ3k8NTJlPDT1WlMElcGkY6UYjMa2tDSH3IpKOEZoiFTWqni54DAwQsLDGsqa3Pu8cUFBnEtr8gHyU4Nz3cwsMKDA/GV1tGRUtCKjDczM7NfXzMvcza1Nv///+9PUmhfZRxY2y2KT/15eLo4ud5fKXCXmTnu7ekZ3pgFkFTJlOEZoiUGT5aHkp8GEBzF0G0FzadGDtKQnNeJ1JqJk5fGEReGkaDGT8UYqGlSw8iAAAAwXRSTlMA87vu8R/SwN6iQP7+/vf9/J75s4DT/v0gokr33vzj++7+9/Hz8/3u1tFw9P4f5nP9cvl0/vb+/vL79HH9++WPMFA7s1r++vRhscXEiWT9PvLQ+Ffzih/9/vb+9z3Enn7N/cWI/RDWPND+9/38gTx6uPj5/fn+/efauu7k8fnl0+ro/f33wvj7meDU2PeaZquWH9jJ1O0QrPfC0vXo+uHj+J7ETZvkpfzI+6e44qCorUr22cpX3xDd9VdUvtb6V9z+sGF5dwAACP1JREFUeF7s011r01AcBvATON8gFCgkV+2AFrKSm5MGCEKlDIqCgEgpXYUaOkanQLrtpupgCxTY8A3EDWToYBNlgFeiIOIX+f/z0pe96IcwSZtRxY0ByXaT3204nIfnPCHXLJFIJBKJgoe8LLyp/+fbPXJ16mvW3k7XsjiOs3xGd+1FoVAn12Hh1g7HqcYqMsdxGAZ0K8B15avOUkGPQymFvm0Plb6InrKOuqEbqoHVd1vPSfxk+fvT/VZRpBQ0aoLPtRW7VptRKD0VGTKcmNva/0biJPmVjDZUtXN8egKBXIM3IeC64NEohHlGvV6WxOcTj4hHhmq015dHyASh0ciXSKjUhAka5in21AMSi0ev3v7UEfEEjM5Rtbd+mPssSeQfz8JEIgZoR7VIHB6ubFvj4WqQ4xvnTqIkgE+j6KPQiSHOe54vlx0Krj38BYJ08bp27UUAcZyHQibiOJIsV9DXV4a1mrKYk8jFSndn+qCJwXuJZmYt2mKy6HvyemlJ8Zd7iSO3Bx8ANKCITDONQpTVtNCzam2vfHVBOK+OvLek/FRpmy4ABWBIob0X5TsF1Th6FY/NHC9NN5BOzadvzg5m06ldmGiSiQYAOCYwBpmNHyQaX+QW+ljbPDjkH5CJheCnnx+MDZU7j+FMcyqOSDU0Ye5jNL1UshhwaNvwo4SK4mYqNQjZGvzl/lkck1GKsPz7xiUu+0Nq2b+2VYVx/NDZJTYmnV2TpuvMsiJNhbSUZmMwSpssENJl7XSmrrDNpkpn3dqO4eraoqXFMmddBWcVncImDpgOMKiiImJu3t+Wl9a54UiccOxA8keY+5xzc25ugiTx+9s5fHL55D7nPM9dk5FY6NpO1wVgJ8g0pVIpv793mWLP31JEeiMKiCa5yeu8CRIeP8STySzLIMv5VSrl+e1YLne0Ap3BMMcnNE/XdV5Ybyer+lcOZyGeIsyKn+AxSDR8qcVwq9X6Lj+sDuwlm8FMJsiJ4o2fSX9fyeeXuY2D6MrpvDz1KEtylmIG/uh2Y6ZDlOomGxBaxx86CzovybniRG12VEEMUaCXLGV03svSPPaMXsBG8jKCDssHc3aE1BgLOj9OCzoshoYKdExxYL3zpTpuODZbo6+f7hKw0A5e5sBDqQ63MGcfwkxnHZXqeL+pQEd7kbpLdY5kwebt0f1HeGwbwYy8zsGMC7Ain9UfmE5va32pDqfXVuCjCwB73Vys0wUy+0f3fV6EeWLqkRn0U13QR9MTEOql4HXI5nZE304Ilo2E6KmkWnYCh9eKdMhI2LpxwU2xaYp10lZsdWKsbj138klVD/X55Q+Mnc/mOyC0bKLjvf3c4sBJB7mX8ekKdCb0rFpMh7ThrcPCNJhRK9kVrG/txkKGkMvHQe48wOpdu1dop6Q6j6N8Glxs8R9pgNAyXDSLdIJZyE4B+zkWS4QE7Fw33oyRYKxGyEWLYVTXmz/5jn+kGY0FRQYT8kp0tJPNfDb6AI6bpDrURtt/U6PRzArYTX5IaXZo+NzDGI+g99NE5/ivu5ebIbKxv1rEBhXpmL6F0yYn1YrqpDpjFHsHsCaKJUR9JwI66Dp5cY2fHaL3SZ75p3qd1QV4yLSDlkEr0mE2XcYQYF9RbHyzSMeaR66SpnS6GcmFrvzIVq2OthMgn9YyTP6cSawj2LhPJGCnrYAlxTrOeoROXSKH52umc2FfVTqsCFE9QgagAw6RztNuavNG8i7s5DE9wSIiHesuNNONP/ZKdFS5RXm1Oqtwo8KDhbGun0DIRXUKNlNGKab8HXRo8x5xYkyP8m1LQWcAVauj1QEz/AVC5jOkDHbk7mAzi9hsklr1ibAk04GBOksb4by2y8bRn1elw2rFqWACwLwOda6/WqTjXpnCyR6GGQAL7FWfuspuFk7aomRK9L+40lKzzhwUIQBNfzAOvOpgRqxzaOVvjCMi7HJc6N91gs7DE+M+OrWW9mSequ3tsFo19svymWwjFdlT0OF3dRGFIpkog1kEnZag0hfmSO4YX9u6UrOOqYcrSWic6LB4H5TDHENwdooSMB6/AfepNh2olTTpEh1jOUyJS3QCCU/uygCqUQfmeGmGz0p0wvfLYjGpTih9/ti1F1CtOvCVU5qwR/KZd7etLDbbIcHaz+euIVS7jiPAlYsKziiLr688tsSwhU877tu+XDyK/ofOxIZMHH3KD4m0D6q2QVpINu4p8lHyiQCRUCh6lYb2tUkZRJdI+5v+fCs38BGCyGgQaofHqC7DtrD4tx07aGkbDAM4/hTmB5gFhqAILAFs0SHYpqaMwkwRhtBWtmp0FobFURqw1uJlaQdO6SVMB0zZmNCeelLmbd1p32CXIjj2BNNkZUnyIZa0tKlujAFtveR3ed/b++fhvbwv/JcvDVFDmaSQg7YzSrkhile6MjW3OQQt4Ekkxp/PhsPJmRgDvZQp3mdlXVE4Bdo8tP36pqI0z/MP8d1T6FIdVWeXxEDW9TICPRUXfFwFzRzliZ0T/UnV63XqyhqL5Y77EXR58D5dW/KryUXXIfTY6TzBss2cNTsHdVlOIVIcRSPi3vq1lmNXdrx2guF548NbgJ4PR02lsG7mjEDHKCJP0/wen5hITEK3Y5crvY1oxRRC0HMHMyparudA1T0x0SmxTbqzaTTtzhvCaRx6blLwYTtnCv5paHPkbNSKGcuVDCF4BH1QXg50cuzx/GlzZO3iG5nO1jBcNIxCEPpjoyFhE0WSCgd/88IzZ/26kT++tq6MEItAv2yI2u4YoqZpiKR+8x+9ulB+TIiSTHKsjL+aVybGHEH/lEXMhRElUULUFZ1f94DlzfT0gntjJ5kVTX5JRZ0lKyclI8NAX00TGiKqhN9cUmSF06Mpmq7L2wHRxq5UFOXzyetMKA79RgQQ0TycCEgqpnRdJ/NsXkaU8kvnH4fvnSe9Oe9qfnXZ2I/DAHwq5cY0QrT4Ec0d4feLor5y8X14a+vycnExFotlQgwMSkQo+cRWD2EuLTve3LIh7L86fAaDFr/rbRgzXsuOz+fzFnNFo3AQZODWMJmCYdsPReDWMXEm2NTd4nA4HA6H4zc5mbo+QO8AVQAAAABJRU5ErkJggg==');\n    background-size: 100%;\n    background-repeat: no-repeat;\n    padding-top: 58.45%; /* aspect ratio of the background image */\n}\n\n.aladin-col {\n    float: left;\n    width: 45.00%;\n    margin-right: 5.0%;\n}\n  /* Clear floats after the columns */\n.aladin-row:after {\n    content: \"\";\n    display: table;\n    clear: both;\n }\n\n.aladin-location {\n\tz-index: 20;\n\tposition:absolute;\n    top: 0px;\n\tpadding: 2px 4px 2px 4px;\n\tbackground-color: rgba(255, 255, 255, 0.5);\n\tfont-size: 11px;\n}\n\n.aladin-projSelection {\n\tz-index: 20;\n\tposition:absolute;\n    top: 0px;\n    right: 48px;\n\tpadding: 2px 4px 2px 4px;\n\tbackground-color: rgba(255, 255, 255, 0.5);\n\tfont-size: 11px;\n}\n\n.aladin-location-text {\n\tfont-size: 13px;\n    margin-left: 4px;\n}\n\n.aladin-measurement-div {\n\tz-index: 77;\n\tposition:absolute;\n    bottom: 20px;\n\tbackground-color: rgba(255, 255, 255, 0.8);\n    font-family: monospace;\n\tfont-size: 12px;\n    display: none;\n    width: 100%;\n    overflow: auto;\n}\n\n.aladin-measurement-div table {\n\tpadding: 2px 4px 2px 4px;\n    table-layout: fixed;\n    white-space: nowrap;\n}\n\n.aladin-measurement-div thead {\n    background-color: #e0e0e0;\n    color: #000;\n}\n\n.aladin-measurement-div td, .aladin-measurement-div th {\n    /*\n    border-left-color: #cbcbcb;\n    border-left-style: solid;\n    */\n    padding: 0.3em 0.3em;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    text-align: left;\n}\n\n.aladin-marker-measurement {\n    max-height: 130px;\n    overflow-y: auto;\n    overflow-x: hidden;\n    font-family: monospace;\n\tfont-size: 11px;\n    color: #000;\n}\n.aladin-marker-measurement table {\n    table-layout: fixed;\n    width: 100%;\n}\n.aladin-marker-measurement table tr td{\nword-wrap:break-word;\n}\n.aladin-marker-measurement tr:nth-child(even) {\n    background-color: #dddddd;\n}\n.aladin-marker-measurement td:first-child {\n    font-weight: bold;\n}\n\n.aladin-fov {\n    z-index: 20;\n    position: absolute;\n    padding: 0;\n    font-size: 12px;\n    font-weight: bold;\n    bottom: 0px;\n    padding: 2px;\n    color: #321bdf;\n    /*text-shadow: 0 0 1px white, 0 0 1px white, 0 0 1px white, 0 0 1px white, 0 0 1px white;*/\n\tbackground-color: rgba(255, 255, 255, 0.5);\n}\n\n/* maximize/restore size icons */\n.aladin-maximize {\n\tposition: absolute;\n\ttop: 6px;\n\tright: 3px;\n\tz-index: 20;\n\twidth: 30px;\n\theight: 30px;\n\tbackground-image: url('data:image/gif;base64,R0lGODlhFgAWAOMJAAAAAAEBAQICAgMDAwUFBAUFBQcHBwgICAsLCv///////////////////////////yH5BAEKAA8ALAAAAAAWABYAAARm8MlJabr41i0T+CCQcJz3CYMwklsSEAUhspVnHEYw0x1w558VzYQTBXm24sgjJCUQykmT9dzxWlNq9vrwILYtqe/wRc6SBqszOE6DLZ/AT00FyKNcD4wQeLdQAiB+cCFHVxkZXA8RADs=');\n\tbackground-repeat:  no-repeat;\n\tbackground-position:center center;\n}\n\n.aladin-layersControl-container {\n    position: absolute;\n    top: 30px;\n    left: 4px;\n    cursor:pointer;\n    z-index: 20;\n    background: rgba(250, 250, 250, 0.8);\n    border-radius: 4px;\n}\n\n.aladin-layersControl-container:hover {\n\tbackground: rgba(220, 220, 220, 0.8);\n}\n\n.aladin-layersControl {\n\twidth: 32px;\n    height: 34px;\n    background-image: url('data:image/gif;base64,R0lGODlhGQAcAMIAAAAAADQ0NKahocvFxf///wAAAAAAAAAAACH5BAEKAAcALAAAAAAZABwAAANneLoH/hCwyaJ1dDrCuydY1gBfyYUaaZqosq0r+sKxNNP1pe98Hy2OgXBILLZGxWRSBlA6iZjgczrwWa9WIEDA7Xq/R8d3PGaSz97oFs0WYN9wiDZAr9vvYcB9v2fy/3ZqgIN0cYZYCQA7');\n    background-repeat:  no-repeat;\n    background-position:center center;\n}\n\n.aladin-layerBox {\n    top: 30px;\n    padding: 4px 4px;\n    max-height: 90%;\n    overflow-y: auto;\n}\n\n.aladin-box {\n\tdisplay: none;\n    z-index: 30;\n    position: absolute;\n    background: #eee;\n    left: 4px;\n    border-radius: 4px;\n    font-size: 14px;\n    font-family: Verdana, Lucida, Arial;\n    line-height: 1.3;\n    color: #222;\n    padding: 0.8em;\n}\n\n.aladin-dialog {\n\tdisplay: none;\n    z-index: 30;\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n    background: #eee;\n    border-radius: 4px;\n    font-family: Verdana, Lucida, Arial;\n    line-height: 1.3;\n    color: #222;\n    min-width: 300px;\n    max-width: 500px;\n    padding: 0.8em;\n}\n\nselect {\n    padding: 4px;\n}\n\n.aladin-surveySelection {\n    max-width: 230px;\n}\n\ninput[type=text], input[type=number] {\n    padding: 4px;\n    width: 100%;\n    box-sizing: border-box;\n}\n\n.aladin-box-title {\n  font-size: 16px;\n  font-family: Verdana, Lucida, Arial;\n  line-height: 2.0;\n  font-weight: bold;\n  cursor: pointer;\n  border-radius: 4px;\n}\n\n.aladin-box-content {\n  padding: 10px;\n}\n\n.aladin-text {\n  background-color: #bbb;\n}\n\n.aladin-gotoControl-container {\n\tposition: absolute;\n    top: 68px;\n    left: 4px;\n    cursor:pointer;\n    z-index: 20;\n    background: rgba(250, 250, 250, 0.8);\n    border-radius: 4px;\n}\n\n.aladin-gotoControl-container:hover {\n    background: rgba(220, 220, 220, 0.8);\n}\n\n.aladin-gotoControl {\n    width: 32px;\n    height: 34px;\n    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAASZJREFUeNpiYMAOpIG4GogPAPETIP4PpQ9AxaUZyARsQNwFxN+ghuLC36Dq2EgxXBSITxIwGB2fhOojyuXohl8C4hCk4JCG8i9hsYSgT9qRNPwE4hY8mtig8n+Q9LTjM1waaihMcQ6RQZqD5ig5XAobkRQeJjFRHEbS20iMoigSLYgixnHPkRSRmr6lkfQ+x6UIOfzZyMg3yPFAfx8wAfFNJL49iRYgq7+JS1EFlVJRBS5FcmjxkEak4WnE5gMGaMGFrBhUYjLjUMsMlUd21CJyyqLz0LJHAqpGAso/j6XQ+0NMHiKnNEW3JJyQJZzQ4PpJwLCf0GD5Q44l6DXac6R0jl6jhVBiCbEAlyUh9LDEm9aWPGegMkC35AkDDYAf1OUg7AoQYADEj7juEX/HNAAAAABJRU5ErkJggg==');\n    background-repeat:  no-repeat;\n    background-position:center center;\n}\n\n.aladin-gotoBox {\n    top: 68px;\n    padding: 4px;\n}\n\n.aladin-target-form {\n\tpadding: 5px;\n}\n\n\n.aladin-simbadPointerControl-container {\n    position: absolute;\n    top: 106px;\n    left: 4px;\n    cursor:pointer;\n    z-index: 20;\n    background: rgba(250, 250, 250, 0.8);\n    border-radius: 4px;\n}\n\n.aladin-simbadPointerControl-container:hover {\n    background: rgba(220, 220, 220, 0.8);\n}\n\n.aladin-simbadPointerControl {\n\twidth: 32px;\n    height: 34px;\n    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gEIDgUy0LKZuQAABc5JREFUSEuFln9sVeUZxz/P+97TbmtL0pZrO5wtvT/bkolBQ5gJrh1FO9RNTYSEYEoiywjiHBlbssXNP4Y2ziZLlBJ1GBFnWF2CPya0TgxsMytmY8Fk4/bec3sv1AXaXmYyaBvovec8++Oe2xUw25uc5LzvOe/3+fV9fkhPT1eI/y4BdGEjIs03N3kHXz3kiwix5W0/ERF187l+VZW+RzfLhU8njapec28xjiwSsHCoqqy5a7X/9FPP+R3xRNjzvGagRlW3qyrGmBeBWRuyk6lMpvDm8Ovy0sB+KyI3KhkIkDKu4lQ5jAwfK3XEE02lUmmNqm4AuoE41y4XOC4iR23Inhxz3ane3p5QsVgkELQgwKmA1y2p1bcOv+clo7E7fN9/DNga/Pe3ADAW7LOUBa4K9geMMYOZ3PhfH3jwPnv50mWpWGMjkeUGwKly+N27I14iGv2G+joI9AInRORZERmMJ1te/Oxf/24UkVRrZNkPLl2aGRXkE6AGeFBVVzc2NKT/PPpxPpmMG9/3BVDp6ekKqSoffviHUiISvcP3/f3ASmCfDdlfprPZbKAl8bbIkwBuPrencpaMxmKe5+0CdgCnjTHbMrnxU+vWfT0kIhiANXet9jviiabALSuBfdVfqP5pOpvNqmoFKKqqSVVNJqOxCMBvR34t6fFstqq66klgH3Cb7/s72+Pxpke2b/YAZP36bueDD44X422Rb6vq28AJG7LfqWjeEU/cVCwWnwPCwSPAFHDRcZzdKTdTWGTJr4AuEXnAzefeWb++2zHNNzd5HfFEOGALIjJU0TwAHwImjDW7gT8Bf7TW/gg4WywWhzriifC5uTFJj2ezIjIEoKobOpPJcLg57JuDrx7yA553U2bLaCCIQPOPnKrQ85nx8TNAQYRCejz7D6fK2Qt8VCwWB1q/1F7h/WiA0VUqlpreODjkm4BONZRp58YSt/w9MDkKhI01h1IZt7Dh3rtt3ZLaF2pqa57fcO/dNpXJFIw1vwHClZg03XLTGcp0TgC1IqISpH9CVfuAU8BhETGqmgTaKbulULek9oWlTUuvAExfmK6enZl7QkSWqupaYAxII/goDwG3A68BGSMiWmEKcE0WUg4oIkEmLvrnc+6pIFK5A6gIatx8rj+oLQDZlraWX7j53B5r7VPAlLX2FTef71/WsuzK9IXp6sJkofrLX2m+6uZz/caaV4CLNmR/5uZzT7e2tTxL2UUYY1528/n+SiWcDT7EJ85NrABIj2dzwEXP8zZ2JBLho0d+783OzD0xOzP3veHhY6XORCLse/4mYDqdzeYBzuUnVhDEErisqmL6Ht0sNmQngePAKny+BuUkchxnN7C2OF98PBGNdgY+Dyei0RXz88XHgbWO4/xwkavupFyfTlhrp7Zu2yLmwqeTJpXJFETkKICqbkxGY7GHe7doys0UHMfZBLT6nj8QBHSt7/kDQKvjOJtSbmZaREhGYzFV3QggIkdSbqZwfuK8Maoqbw6/LjZkTwIHgG7P83Z1JpP1ACOfvHsxezbfZ63dScAWG7I7smfzfWcy6WmAFe3t9Z7nfR/oAg7YkD05MPiMqKoYQF8a2G/HXHfKGDMInAZ2zF+d35OMxmKVJApikhaRVMXnFc2vXrn6c+AxysVu75jrTg0ffj8EqI1ElhsRIZGImY//cuqfjQ0NaZTbgPtV9dbG+oYvNtbXFztvTX42c2n2TkFk1aqVoxbz1cb6+od83/8xsBE4LSK73Hxu9J7edaFKXBY6mqpq3ZI6ffut97xEJHq77/s7+fyGI8H79Q1nbyY3fur+b30zNDc7t5BPCx0Nyr3YcRxGRo6V2uPxJq/k/b+WeUJEjlRa5j2960KlYmlxsopcN1VAYM0j2zd7Wx/+rnYmk+FSsdQM1Pi+vx1QY8zLwGVr7VTKzRQGBp+R4cPvh0TkhsniegE3jC3h5rD/xsEhX0S0XLdQN5/vV1XZum2LnJ84/z/Hlv8AT3rLVQaE2oEAAAAASUVORK5CYII=');\n    background-repeat:  no-repeat;\n    background-position:center center;\n}\n\n.aladin-shareControl-container {\n    position: absolute;\n    bottom: 30px;\n    left: 4px;\n    cursor:pointer;\n    z-index: 20;\n    background: rgba(250, 250, 250, 0.8);\n    border-radius: 4px;\n}\n\n.aladin-shareControl-container:hover {\n    background: rgba(220, 220, 220, 0.8);\n}\n\n.aladin-shareControl {\n\twidth: 32px;\n    height: 34px;\n    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAA/1BMVEUAAAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzP////6PkQMAAAAU3RSTlMAAAI2l9TiyXwcBmrj/cEvePX69MD+Vzl06Px5sMgDZPsbOwUfKFGAHVjSEkBgXTcMllbG8rbhdtcm26Ko5/M8F3clPqN1JK+usRpVQdNQBGN9OkYs7f8AAAABYktHRFTkA4ilAAAACXBIWXMAARCQAAEQkAGJrNK4AAABMUlEQVQoz13SeVuCQBAGcAYV5TREEpUQr9TMK9G8Nc/usvn+36VdRFDmz9/uwzuzA8NcFrCRaIyLJ3iAaxdECUnJShKu/UZFTGkyYpoPu67cZows5hKXnif3TfJ5MHS8C9wqcDaaRRILJQ254KBcqd7X6tShYePDmaH52Gp3uq7zacTe+fpTnwQ7gwxJKJqIw4iX++ygW6Ox66oIQf+T6WyOi+WK+osAvptri91sd/tDyF/3u+2GtdZvIT+slgucz6YT3xkQqb/DeHSKd3YnZzpD1wEyA0dHtf9R9h62R5/Snavbabc+m/4mvtBuuF6vfVcrP8EeONRK1MlcNvdrBQdx1A2SwNO58sLF4o45zBp/DUX3+/SKV8iOtRSGnYGkItP+JVEI/RnAH+NSLBphr/0f6ns3OQ1Zz7kAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTMtMTEtMThUMTQ6MzM6NTUrMDE6MDCINg3ZAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDEzLTExLTE4VDE0OjMzOjA0KzAxOjAwF/ywtQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=');\n    background-repeat:  no-repeat;\n    background-position:center center;\n}\n\n.aladin-shareBox {\n    bottom: 30px;\n    padding: 4px;\n}\n\n.aladin-shareInput {\n    width: 300px;\n    margin-top: 10px;\n    display: block;\n}\n\n.aladin-target-form input {\n\twidth: 140px;\n\tmargin-left: 5px;\n}\n\t\n\n\n\n.aladin-cb-list ul {\n    margin: 0;\n    padding-left: 4px;\n    list-style: none;\n}\n\n.aladin-cb-list label {\n\tdisplay: inline;\n}\n\n.aladin-cb-list input[type=\"checkbox\"] {\n    margin: 3px;\n}\n\n.aladin-closeBtn {\n\tfloat:right;\n    margin-top: 0 0 2px 0;\n    cursor:pointer;\n    color: #605F61;\n    border: 1px solid #AEAEAE;\n    border-radius: 3px;\n    background: #fff;\n    font-size: 15px;\n    font-weight: bold;\n    display: inline-block;\n    line-height: 0px;\n    padding: 8px 2px;       \n}\n\n.aladin-closeBtn:hover {\n\tcolor: #201F21;\n}\n\n.aladin-label {\n\tfont-weight: bold;\n\tpadding-bottom: 4px;\n}\n\n.aladin-box-separator {\n\theight: 0;\n    border-top: 1px solid #bbb  ;\n    margin: 5px 0px 5px -4px;\n}\n\n.aladin-blank-separator {\n\theight: 10px;\n}\n\n.aladin-restore {\n\tposition: absolute;\n    top: 6px;\n    right: 3px;\n    z-index: 20;\n    width: 30px;\n    height: 30px;\n    background-image: url('data:image/gif;base64,R0lGODlhFgAWAOMJAAAAAAEBAQICAgMDAwUFBAUFBQcHBwgICAsLCv///////////////////////////yH5BAEKAA8ALAAAAAAWABYAAARk8MlJ60zJapsAyhsFPp1xfKHUZeVhAOPWwYD5xjIABDacXrseLtQhFAiBIVEwEOh8P9VzquRgrhgrNhudTaHdJ1NQ1SQCRgL41zIE1sSa6w0361y0eqXtW7EReCNlIgh6XYMbEQA7');\n    background-repeat:  no-repeat;\n    background-position:center center;\n}\n\n.aladin-fullscreen {\n\tposition: fixed !important;\n\tz-index: 9999;\n\ttop: 0;\n\tleft: 0;\n\theight: 100% !important;\n\twidth: 100% !important;\n\tborder: 0 !important;\n    max-width: none !important;\n    background: #fff; /* allows to hide all HTML elements in the background */\n}\n\n.aladin-zoomControl {\n\tz-index: 20;\n\tposition:absolute;\n\ttop: 50%;\n\theight: 48px;\n\tright: 8px;\n\tpadding: 0;\n\tmargin: -24px 0 0 0;\n\tfont-weight: bold;\n\tfont-size: 18px;\n\tfont-family: Verdana, Lucida, Arial;\n}\n\n\n.aladin-zoomControl a {\n\twidth: 20px;\n\theight:20px;\n\tline-height: 18px;\n\tdisplay:block;\n\tbackground-color:rgba(250, 250, 250, 0.8);\n\tmargin:1px;\n\ttext-align:center;\n\tborder-radius:4px;\n\tborder:1px solid #aaa;\n\ttext-decoration:none;\n\tcolor:#222;\n}\n\n.aladin-zoomControl a:hover {\n\tbackground-color: rgba(220, 220, 220, 0.8);\n}\n\n.aladin-cmSelection {\n    width: 60px;\n    margin-right: 10px;\n}\n\n.aladin-btn {\n\tdisplay: inline-block;\n    padding: 6px 8px;\n    margin-bottom: 0;\n    font-size: 12px;\n    font-weight: normal;\n    text-align: center;\n    white-space: nowrap;\n    vertical-align: middle;\n    cursor: pointer;\n    border: 1px solid transparent;\n    border-radius: 3px;\n    color: #ffffff;\n    background-color: #428bca;\n    border-color: #357ebd;\n    margin-right: 4px;\n}\n\n.aladin-cancelBtn {\n    background-color: #ca4242;\n    border-color: #bd3935;\n}\n\n.aladin-frame {\n    border: 1px solid transparent;\n    border-color: #aaa;\n    padding: 4px 4px 4px 4px;\n}\n\n.aladin-box-content > div {\n    margin: 10px 0px 0px 0px;\n}\n\n.aladin-btn-small {\n\tdisplay: inline-block;\n    border-radius: 3px;\n    margin-bottom: 0;\n    padding: 0;\n    vertical-align: middle;\n    cursor: pointer;\n    border: 1px solid transparent;\n    color: #ffffff;\n    font-size: 14px;\n    background-color: #428bca;\n    border-color: #357ebd;\n    margin-left: 2px;\n    min-width: 1.5em;\n    min-height: 1.5em;\n}\n\n.aladin-button:hover {\n\tcolor: #ffffff;\n    background-color: #3276b1;\n    border-color: #285e8e;\n}\n\n.aladin-unknownObject {\n\tborder: 3px solid red;\n}\n    \n.aladin-popup-container {\n\tz-index: 25;\n\tposition: absolute;\n    width: 200px;\n    display: none;\n    line-height: 1.3;\n}\n\n.aladin-popup {\n\tfont-family: Verdana, Lucida, Arial;\n    font-size: 13px;\n    background: white;\n    border: 1px solid #bbb;\n    border-radius: 4px;\n    padding: 4px;\n    top: 80px;\n    left: 110px;\n}\n\n\n.aladin-popup-arrow {\n    display: block;\n    border-color: #fff transparent transparent;\n    border-style: solid;\n    border-width: 12px;\n    width: 0px;\n    height: 0px;\n    margin-top: -1px;\n    margin-left: auto;\n    margin-right: auto;\n/*\n    width: 15px;\n    height: 15px;\n    background: white;\n    margin: -12px 94px;\n    padding-bottom: 10px;\n    overflow: hidden;\n    -webkit-transform: rotate(45deg);\n       -moz-transform: rotate(45deg);\n        -ms-transform: rotate(45deg);\n         -o-transform: rotate(45deg);\n            transform: rotate(45deg);\n*/\n}\n\n\n.aladin-popupTitle {\n    font-weight: bold;\n}\n\n.aladin-popupText {\n}\n\n.aladin-options {\n    margin-top: 4px;\n}\n\n.aladin-layer-label {\n\tpadding: 0 4px 0 4px;\n\tcolor: #ddd;\n    border-bottom-left-radius:  8px;\n    border-top-left-radius:     8px;\n    border-bottom-right-radius: 8px;\n    border-top-right-radius:    8px;\n    cursor: pointer;\n    user-select: none;\n}\n\n.aladin-sp-title a {\n    text-decoration: none;\n    color: #317d8d;\n}\n\n.aladin-sp-content {\n    font-size: 12px;\n}\n\n.aladin-sp-content a {\n    text-decoration: none;\n    color: #478ade;\n    font-size: 11px;\n}\n\n.aladin-cuts {\n    width: 8em;\n}\n\n.add-layer-hips {\n    margin-top: 0.2em;\n}\n\n\n/* Icons figuring layers in the Stack */\n.aladin-stack-icon {\n\twidth: 16px;\n    height: 16px;\n    background-repeat:  no-repeat;\n    background-position:center center;\n    display: inline-block;\n    vertical-align: text-top;\n}\n\n\n\n.aladin-chevron {\n  display: inline-block;\n  width: 16px;\n  height: 16px;\n  cursor: pointer;\n  vertical-align: middle;\n  background: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDQ0IDQ0IiBzdHJva2U9IiM0NDQiIGJhY2tncm91bmQtY29sb3I9ImJsdWUiPgoKICAgIDxyZWN0IHg9IjIiIHk9IjIiIGhlaWdodD0iNDAiIHdpZHRoPSI0MCIgZmlsbD0idHJhbnNwYXJlbnQiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPgogICAgPHBhdGggZD0iTTEwIDEzIEwyMiAyMSBMMzQgMTMiIGZpbGw9InRyYW5zcGFyZW50IiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPiAKICAgIDxwYXRoIGQ9Ik05IDI1IEwyMiAzMyBMMzUgMjUiIGZpbGw9InRyYW5zcGFyZW50IiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPiAKCjwvc3ZnPgo=') no-repeat;\n}\n.aladin-chevron-down {\n  transform: rotate(0deg);\n}\n.aladin-chevron-left {\n  transform: rotate(90deg);\n}\n.aladin-chevron-up {\n  transform: rotate(180deg);\n}\n.aladin-chevron-right {\n  transform: rotate(270deg);\n}\n\n.indicator {\n    font-family: monospace;\n    cursor: pointer;\n}\n\n.right-triangle:before {\n    content: '\\25b6';\n}\n\n.down-triangle:before {\n    content: '\\25bc';\n}\n\n\n/* *********************************************** */\n\n/* Cursors */\n\n/* Simbad pointer cursor */\n.aladin-sp-cursor {\n    cursor: auto;\n    cursor: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gEIEwUMBS20MQAAApRJREFUWEfdV7GO2zAMfXY7x1luzOFwDeB/KHCAB87eumvqmI/JWhTwF3TIrMFAv8JbgWyHG3IpOjbpcKJC02KipECHclIU+j2KfKRlAABRUyFYak3UgKiZiXUJAIt1d1ysu2PYn53DsPCucpbkRE3JAdxKTtQgWo6zJAfGGbAwLuEV7OB9/yrXIbqZ9/0+rMuhdb+RYfWmm+fged8fihzyoXXxlNcYB2KRxwwA6SzI9Crgd973B/5/u3IF8FYSw98M5D2QR86kRE3pfX+AMqKm8iEQoqYaWrfj/4bW7QgokMhCeSs5KeVrDM4K29C6Y6oE0YGEUlndocVGyg/rGZDXBQpr0kmjLiAlOOvk3vf7RJZM5Q+te2W/7coVEq+wnC1yCZYyS3B8MMYF3vBKK9Jz5PWmm8sab1eu4N9D63aaHEAsH88SzmQpnSHsHDmnWvlXIoiJ4JTviY8FRUJ8ZAiOEiJbLpcjARM1M0twpmjZOeGQrXYm1/7yMLz/eH8fnyus6XXOtmLgWBrKtdMguNKYPPystIausn9egsVDfI674KxS6003F/sX357AdOBwcADwWD9EjBKJubxYd0cml4RhP5IPrduFk04GjiZXMyZiRHKdAU3OWeB2lLNAk+tpl9IHY0zSlBo4OgsaTJpFzs+F0pxKYEXK73Nd8+3KFfWmG71qGfgSeQqPN0fvdlZrSvmUoXaJJ7EiocArZaS6tgzA+5RQe3gumUl5gPLXzy+6pEQNzDuhvFKx1ZuuEuTxliwmY/KuoHxGhzGv5QDw9PTx7senz88aLHUpJeOu8OHb17u+//4CTMm97/eFVQK5vqR8y6xOyipByjn3+0C3moUH4O++D1UX3PR9eJWzJCf6Tz5O/wDUeIfTLPlbywAAAABJRU5ErkJggg==') 15 15, auto;\n}\n\n/* *********************************************** */\n\n/* Autocomplete styles (adapted from https://github.com/kraaden/autocomplete ) */\n.autocomplete {\n    background: white;\n    z-index: 20000;\n    font: 14px/22px \"-apple-system\", BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n    overflow: auto;\n    box-sizing: border-box;\n    border: 1px solid rgba(50, 50, 50, 0.6);\n}\n\n.autocomplete * {\n    font: inherit;\n}\n\n.autocomplete > div {\n    padding: 0 4px;\n}\n\n.autocomplete .group {\n    background: #eee;\n}\n\n.autocomplete > div:hover:not(.group),\n.autocomplete > div.selected {\n    background: #81ca91;\n    cursor: pointer;\n}\n",
          ],
          sourceRoot: "",
        },
      ]);
      // Exports
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ___CSS_LOADER_EXPORT___;

      /***/
    },

    /***/ 3645: /***/ (module) => {
      "use strict";

      /*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
      // css base code, injected by the css-loader
      // eslint-disable-next-line func-names
      module.exports = function (cssWithMappingToString) {
        var list = []; // return the list of modules as css string

        list.toString = function toString() {
          return this.map(function (item) {
            var content = cssWithMappingToString(item);

            if (item[2]) {
              return "@media ".concat(item[2], " {").concat(content, "}");
            }

            return content;
          }).join("");
        }; // import a list of modules into the list
        // eslint-disable-next-line func-names

        list.i = function (modules, mediaQuery, dedupe) {
          if (typeof modules === "string") {
            // eslint-disable-next-line no-param-reassign
            modules = [[null, modules, ""]];
          }

          var alreadyImportedModules = {};

          if (dedupe) {
            for (var i = 0; i < this.length; i++) {
              // eslint-disable-next-line prefer-destructuring
              var id = this[i][0];

              if (id != null) {
                alreadyImportedModules[id] = true;
              }
            }
          }

          for (var _i = 0; _i < modules.length; _i++) {
            var item = [].concat(modules[_i]);

            if (dedupe && alreadyImportedModules[item[0]]) {
              // eslint-disable-next-line no-continue
              continue;
            }

            if (mediaQuery) {
              if (!item[2]) {
                item[2] = mediaQuery;
              } else {
                item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
              }
            }

            list.push(item);
          }
        };

        return list;
      };

      /***/
    },

    /***/ 4015: /***/ (module) => {
      "use strict";

      function _slicedToArray(arr, i) {
        return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
      }

      function _nonIterableRest() {
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
        );
      }

      function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
      }

      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++) {
          arr2[i] = arr[i];
        }
        return arr2;
      }

      function _iterableToArrayLimit(arr, i) {
        var _i = arr && ((typeof Symbol !== "undefined" && arr[Symbol.iterator]) || arr["@@iterator"]);
        if (_i == null) return;
        var _arr = [];
        var _n = true;
        var _d = fllse;
        var _s, _e;
        try {
          for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
          }
        } catch (err) {
          _d = true;
          _e = err;
        } finally {
          try {
            if (!_n && _i["return"] != null) _i["return"]();
          } finally {
            if (_d) throw _e;
          }
        }
        return _arr;
      }

      function _arrayWithHoles(arr) {
        if (Array.isArray(arr)) return arr;
      }

      module.exports = function cssWithMappingToString(item) {
        var _item = _slicedToArray(item, 4),
          content = _item[1],
          cssMapping = _item[3];

        if (!cssMapping) {
          return content;
        }

        if (typeof btoa === "function") {
          // eslint-disable-next-line no-undef
          var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
          var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
          var sourceMapping = "/*# ".concat(data, " */");
          var sourceURLs = cssMapping.sources.map(function (source) {
            return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
          });
          return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
        }

        return [content].join("\n");
      };

      /***/
    },

    /***/ 3379: /***/ (module) => {
      "use strict";

      var stylesInDOM = [];

      function getIndexByIdentifier(identifier) {
        var result = -1;

        for (var i = 0; i < stylesInDOM.length; i++) {
          if (stylesInDOM[i].identifier === identifier) {
            result = i;
            break;
          }
        }

        return result;
      }

      function modulesToDom(list, options) {
        var idCountMap = {};
        var identifiers = [];

        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          var id = options.base ? item[0] + options.base : item[0];
          var count = idCountMap[id] || 0;
          var identifier = "".concat(id, " ").concat(count);
          idCountMap[id] = count + 1;
          var indexByIdentifier = getIndexByIdentifier(identifier);
          var obj = {
            css: item[1],
            media: item[2],
            sourceMap: item[3],
            supports: item[4],
            layer: item[5],
          };

          if (indexByIdentifier !== -1) {
            stylesInDOM[indexByIdentifier].references++;
            stylesInDOM[indexByIdentifier].updater(obj);
          } else {
            var updater = addElementStyle(obj, options);
            options.byIndex = i;
            stylesInDOM.splice(i, 0, {
              identifier: identifier,
              updater: updater,
              references: 1,
            });
          }

          identifiers.push(identifier);
        }

        return identifiers;
      }

      function addElementStyle(obj, options) {
        var api = options.domAPI(options);
        api.update(obj);

        var updater = function updater(newObj) {
          if (newObj) {
            if (
              newObj.css === obj.css &&
              newObj.media === obj.media &&
              newObj.sourceMap === obj.sourceMap &&
              newObj.supports === obj.supports &&
              newObj.layer === obj.layer
            ) {
              return;
            }

            api.update((obj = newObj));
          } else {
            api.remove();
          }
        };

        return updater;
      }

      module.exports = function (list, options) {
        options = options || {};
        list = list || [];
        var lastIdentifiers = modulesToDom(list, options);
        return function update(newList) {
          newList = newList || [];

          for (var i = 0; i < lastIdentifiers.length; i++) {
            var identifier = lastIdentifiers[i];
            var index = getIndexByIdentifier(identifier);
            stylesInDOM[index].references--;
          }

          var newLastIdentifiers = modulesToDom(newList, options);

          for (var _i = 0; _i < lastIdentifiers.length; _i++) {
            var _identifier = lastIdentifiers[_i];

            var _index = getIndexByIdentifier(_identifier);

            if (stylesInDOM[_index].references === 0) {
              stylesInDOM[_index].updater();

              stylesInDOM.splice(_index, 1);
            }
          }

          lastIdentifiers = newLastIdentifiers;
        };
      };

      /***/
    },

    /***/ 569: /***/ (module) => {
      "use strict";

      var memo = {};
      /* istanbul ignore next  */

      function getTarget(target) {
        if (typeof memo[target] === "undefined") {
          var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

          if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
            try {
              // This will throw an exception if access to iframe is blocked
              // due to cross-origin restrictions
              styleTarget = styleTarget.contentDocument.head;
            } catch (e) {
              // istanbul ignore next
              styleTarget = null;
            }
          }

          memo[target] = styleTarget;
        }

        return memo[target];
      }
      /* istanbul ignore next  */

      function insertBySelector(insert, style) {
        var target = getTarget(insert);

        if (!target) {
          throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
        }

        target.appendChild(style);
      }

      module.exports = insertBySelector;

      /***/
    },

    /***/ 9216: /***/ (module) => {
      "use strict";

      /* istanbul ignore next  */
      function insertStyleElement(options) {
        var element = document.createElement("style");
        options.setAttributes(element, options.attributes);
        options.insert(element, options.options);
        return element;
      }

      module.exports = insertStyleElement;

      /***/
    },

    /***/ 3565: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      "use strict";

      /* istanbul ignore next  */
      function setAttributesWithoutAttributes(styleElement) {
        var nonce = true ? __webpack_require__.nc : 0;

        if (nonce) {
          styleElement.setAttribute("nonce", nonce);
        }
      }

      module.exports = setAttributesWithoutAttributes;

      /***/
    },

    /***/ 7795: /***/ (module) => {
      "use strict";

      /* istanbul ignore next  */
      function apply(styleElement, options, obj) {
        var css = "";

        if (obj.supports) {
          css += "@supports (".concat(obj.supports, ") {");
        }

        if (obj.media) {
          css += "@media ".concat(obj.media, " {");
        }

        var needLayer = typeof obj.layer !== "undefined";

        if (needLayer) {
          css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
        }

        css += obj.css;

        if (needLayer) {
          css += "}";
        }

        if (obj.media) {
          css += "}";
        }

        if (obj.supports) {
          css += "}";
        }

        var sourceMap = obj.sourceMap;

        if (sourceMap && typeof btoa !== "undefined") {
          css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
        } // For old IE

        /* istanbul ignore if  */

        options.styleTagTransform(css, styleElement, options.options);
      }

      function removeStyleElement(styleElement) {
        // istanbul ignore if
        if (styleElement.parentNode === null) {
          return false;
        }

        styleElement.parentNode.removeChild(styleElement);
      }
      /* istanbul ignore next  */

      function domAPI(options) {
        var styleElement = options.insertStyleElement(options);
        return {
          update: function update(obj) {
            apply(styleElement, options, obj);
          },
          remove: function remove() {
            removeStyleElement(styleElement);
          },
        };
      }

      module.exports = domAPI;

      /***/
    },

    /***/ 4589: /***/ (module) => {
      "use strict";

      /* istanbul ignore next  */
      function styleTagTransform(css, styleElement) {
        if (styleElement.styleSheet) {
          styleElement.styleSheet.cssText = css;
        } else {
          while (styleElement.firstChild) {
            styleElement.removeChild(styleElement.firstChild);
          }

          styleElement.appendChild(document.createTextNode(css));
        }
      }

      module.exports = styleTagTransform;

      /***/
    },

    /***/ 9825: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision lowp float;layout(location=0)in vec2 offset;layout(location=1)in vec2 uv;layout(location=2)in vec3 center;uniform float current_time;uniform mat4 model;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform vec2 kernel_size;out vec2 out_uv;out vec3 out_p;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){vec3 p=vec3(inv_model*vec4(center,1.0f));vec2 center_pos_clip_space=world2clip_aitoff(p);vec2 pos_clip_space=center_pos_clip_space;gl_Position=vec4((pos_clip_space/(ndc_to_clip*czf))+offset*kernel_size,0.f,1.f);out_uv=uv;out_p=p;}";

      /***/
    },

    /***/ 4831: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision lowp float;layout(location=0)in vec2 offset;layout(location=1)in vec2 uv;layout(location=2)in vec3 center;uniform float current_time;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform vec2 kernel_size;out vec2 out_uv;out vec3 out_p;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){vec3 p=vec3(inv_model*vec4(center,1.0f));vec2 center_pos_clip_space=world2clip_arc(p);vec2 pos_clip_space=center_pos_clip_space;gl_Position=vec4((pos_clip_space/(ndc_to_clip*czf))+offset*kernel_size,0.f,1.f);out_uv=uv;out_p=p;}";

      /***/
    },

    /***/ 7624: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision lowp float;in vec2 out_uv;in vec3 out_p;out vec4 color;uniform sampler2D kernel_texture;uniform float max_density;uniform float fov;uniform float strength;void main(){color=texture(kernel_texture,out_uv)/max(log2(fov*100.),1.);color.r*=strength;}";

      /***/
    },

    /***/ 610: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision lowp float;layout(location=0)in vec2 offset;layout(location=1)in vec2 uv;layout(location=2)in vec3 center;uniform float current_time;uniform mat4 model;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform vec2 kernel_size;out vec2 out_uv;out vec3 out_p;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){vec3 p=vec3(inv_model*vec4(center,1.0f));vec2 center_pos_clip_space=world2clip_healpix(p);vec2 pos_clip_space=center_pos_clip_space;gl_Position=vec4((pos_clip_space/(ndc_to_clip*czf))+offset*kernel_size,0.f,1.f);out_uv=uv;out_p=p;}";

      /***/
    },

    /***/ 423: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision lowp float;layout(location=0)in vec2 offset;layout(location=1)in vec2 uv;layout(location=2)in vec3 center;uniform float current_time;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform vec2 kernel_size;out vec2 out_uv;out vec3 out_p;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.h)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 wnrld2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minub_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){vec3 p=vec3(inv_model*vec4(center,1.0f));vec2 center_pos_clip_space=world2clip_mercator(p);vec2 pos_clip_space=center_pos_clip_space;gl_Position=vec4((pos_clip_space/(ndc_to_clip*czf))+offset*kernel_size,0.f,1.f);out_uv=uv;out_p=p;}";

      /***/
    },

    /***/ 7892: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision lowp float;layout(location=0)in vec2 offset;layout(location=1)in vec2 uv;layout(location=2)in vec3 center;uniform float current_time;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform vec2 kernel_size;out vec2 out_uv;out vec3 out_p;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){vec3 p=vec3(inv_model*vec4(center,1.0f));vec2 center_pos_clip_space=world2clip_mollweide(p);vec2 pos_clip_space=center_pos_clip_space;gl_Position=vec4((pos_clip_space/(ndc_to_clip*czf))+offset*kernel_size,0.f,1.f);out_uv=uv;out_p=p;}";

      /***/
    },

    /***/ 7585: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision lowp float;in vec2 out_uv;in vec3 out_p;out vec4 color;uniform sampler2D kernel_texture;uniform float max_density;uniform float fov;uniform float strength;void main(){if(out_p.z<0.f){discard;}color=texture(kernel_texture,out_uv)/max(log2(fov*100.),1.);color.r*=strength;}";

      /***/
    },

    /***/ 3418: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision lowp float;layout(location=0)in vec2 offset;layout(location=1)in vec2 uv;layout(location=2)in vec3 center;uniform float current_time;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform vec2 kernel_size;out vec2 out_uv;out vec3 out_p;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4441094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sdrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){vec3 p=vec3(inv_model*vec4(center,1.0f));vec2 center_pos_clip_space=world2clip_orthographic(p);vec2 pos_clip_space=center_pos_clip_space;gl_Position=vec4((pos_clip_space/(ndc_to_clip*czf))+offset*kernel_size,0.f,1.f);out_uv=uv;out_p=p;}";

      /***/
    },

    /***/ 9494: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision lowp float;layout(location=0)in vec2 offset;layout(location=1)in vec2 uv;layout(location=2)in vec3 center;uniform float current_time;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform vec2 kernel_size;out vec2 out_uv;out vec3 out_p;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){vec3 p=vec3(inv_model*vec4(center,1.0f));vec2 center_pos_clip_space=world2clip_gnomonic(p);vec2 pos_clip_space=center_pos_clip_space;gl_Position=vec4((pos_clip_space/(ndc_to_clip*czf))+offset*kernel_size,0.f,1.f);out_uv=uv;out_p=p;}";

      /***/
    },

    /***/ 9820: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision lowp float;precision lowp sampler2D;in vec2 out_uv;out vec4 color;uniform sampler2D texture_fbo;uniform float alpha;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}void main(){float opacity=texture(texture_fbo,out_uv).r;float o=smoothstep(0.,0.1,opacity);color=colormap_f(opacity);color.a=o*alpha;}";

      /***/
    },

    /***/ 652: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision lowp float;precision lowp sampler2D;layout(location=0)in vec2 position;layout(location=1)in vec2 uv;out vec2 out_uv;void main(){gl_Position=vec4(position,0.f,1.f);out_uv=uv;}";

      /***/
    },

    /***/ 1104: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;out vec4 c;in vec2 pos_clip;uniform vec4 color;uniform mat4 model;uniform mat4 to_icrs;uniform mat4 to_galactic;uniform mat4 inv_model;uniform float czf;uniform float meridians[20];uniform int num_meridians;uniform float parallels[10];uniform int num_parallels;uniform vec2 window_size;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}bool is_included_inside_projection(vec2 pos_clip_space){float px2=pos_clip_space.x*pos_clip_space.x;float py2=pos_clip_space.y*pos_clip_space.y;return(px2*0.25+py2)<=0.25;}vec3 clip2world_aitoff(vec2 pos_clip_space){if(!is_included_inside_projection(pos_clip_space)){discard;}vec2 uv=vec2(pos_clip_space.x*PI*0.5,pos_clip_space.y*PI);float c=length(uv);float phi=asin(uv.y*sin(c)/c);float theta=atan(uv.x*sin(c),c*cos(c))*2.;vec3 world=vec3(sin(theta)*cos(phi),sin(phi),cos(theta)*cos(phi));return world;}float d_isolon(vec3 pos_model,float theta){vec3 posmodel=pos_model;vec3 n=vec3(cos(theta),0.,-sin(theta));vec3 e_xz=vec3(-n.z,0.,n.x);if(dot(posmodel,e_xz)<0.){return 1e3;}float d=abs(dot(n,posmodel));vec3 h_model=normalize(posmodel-n*d);vec3 h_world=vec3(inv_model*to_icrs*vec4(h_model,1.f));h_world=check_inversed_longitude(h_world);vec2 h_clip=world2clip_aitoff(h_world);return length(pos_clip-h_clip)*2.;}float d_isolat(vec3 pos_model,float delta){vec3 posmodel=pos_model;float y=atan(posmodel.y,length(pos_model.xz));float d=abs(y-delta);return d;}float grid_alpha(vec3 p){float v=1e10;float delta=asin(p.y);float theta=atan(p.x,p.z);float m=0.;float mdist=10.;for(int i=0;i<num_meridians;i++){float tmp=meridians[i];if(tmp>PI){tmp-=2.*PI;}float d=abs(theta-tmp);if(d<mdist){mdist=d;m=tmp;}}float par=0.;float pdist=10.;for(int i=0;i<num_parallels;i++){float d=abs(delta-parallels[i]);if(d<pdist){pdist=d;par=parallels[i];}}v=min(d_isolon(p,m),v);v=min(d_isolat(p,par),v);float eps=3.*czf/window_size.x;return smoothstep(eps,2.*eps,v);}void main(){vec4 transparency=vec4(0.f,0.f,0.f,0.f);vec3 pos_world=clip2world_aitoff(pos_clip);vec3 pos_model=vec3(to_galactic*model*vec4(pos_world,1.f));float alpha=grid_alpha(pos_model);c=mix(color,transparency,alpha);}";

      /***/
    },

    /***/ 5640: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;out vec4 c;in vec2 pos_clip;uniform vec4 color;uniform mat4 model;uniform mat4 inv_model;uniform mat4 to_icrs;uniform mat4 to_galactic;uniform float czf;uniform float meridians[20];uniform int num_meridians;uniform float parallels[10];uniform int num_parallels;uniform vec2 window_size;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}float sinc_positive(float x){if(x>1.0e-4){return sin(x)/x;}else{x=x*x;return 1.-x*(1.-x/20.)/6.;}}vec3 clip2world_arc(vec2 pos_clip_space){float x=pos_clip_space.x*PI;float y=pos_clip_space.y*PI;float r=length(vec2(x,y));if(r<=PI){float z=cos(r);r=sinc_positive(r);return vec3(x*r,y*r,z);}discard;}float d_isolon(vec3 pos_model,float theta){vec3 n=vec3(cos(theta),0.,-sin(theta));vec3 e_xz=vec3(-n.z,0.,n.x);if(dot(pos_model,e_xz)<0.){return 1e3;}float d=abs(dot(n,pos_model));vec3 h_model=normalize(pos_model-n*d);vec3 h_world=vec3(inv_model*to_icrs*vec4(h_model,1.f));vec2 h_clip=world2clip_arc(h_world);return length(pos_clip-h_clip)*2.;}float d_isolat(vec3 pos_model,float delta){float y=atan(pos_model.y,length(pos_model.xz));float d=abs(y-delta);return d;}float grid_alpha(vec3 p){float v=1e10;float delta=asin(p.y);float theta=atan(p.x,p.z);float m=0.;float mdist=10.;for(int i=0;i<num_meridians;i++){float tmp=meridians[i];if(tmp>PI){tmp-=2.*PI;}float d=abs(theta-tmp);if(d<mdist){mdist=d;m=tmp;}}float par=0.;float pdist=10.;for(int i=0;i<num_parallels;i++){float d=abs(delta-parallels[i]);if(d<pdist){pdist=d;par=parallels[i];}}v=min(d_isolon(p,m),v);v=min(d_isolat(p,par),v);float eps=3.*czf/window_size.x;return smoothstep(eps,2.*eps,v);}void main(){vec4 transparency=vec4(0.f,0.f,0.f,0.f);vec3 pos_world=clip2world_arc(pos_clip);pos_world=check_inversed_longitude(pos_world);vec3 pos_model=vec3(to_galactic*model*vec4(pos_world,1.f));float alpha=grid_alpha(pos_model);c=mix(color,transparency,alpha);}";

      /***/
    },

    /***/ 2992: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;layout(location=0)in vec2 position;out vec2 pos_clip;uniform vec2 ndc_to_clip;uniform float czf;void main(){pos_clip=position*(ndc_to_clip*czf);gl_Position=vec4(position,0.,1.);}";

      /***/
    },

    /***/ 8371: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision lowp float;out vec4 frag_color;uniform vec4 color;uniform float opacity;const float PI=3.141592653589793f;void main(){frag_color=color;}";

      /***/
    },

    /***/ 4579: /***/ (module) => {
      module.exports = "#version 300 es\nprecision lowp float;layout(location=0)in vec2 ndc_pos;void main(){gl_Position=vec4(ndc_pos,0.,1.);}";

      /***/
    },

    /***/ 1770: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;out vec4 c;in vec2 pos_clip;uniform vec4 color;uniform mat4 model;uniform mat4 inv_model;uniform mat4 to_icrs;uniform mat4 to_galactic;uniform float czf;uniform float meridians[20];uniform int num_meridians;uniform float parallels[10];uniform int num_parallels;uniform vec2 window_size;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}vec3 clip2world_mercator(vec2 p){float theta=p.x*PI;float delta=atan(sinh(p.y))*PI;return vec3(sin(theta)*cos(delta),sin(delta),cos(theta)*cos(delta));}float d_isolon(vec3 pos_model,float theta){vec3 n=vec3(cos(theta),0.,-sin(theta));vec3 e_xz=vec3(-n.z,0.,n.x);if(dot(pos_model,e_xz)<0.){return 1e3;}float d=abs(dot(n,pos_model));vec3 h_model=normalize(pos_model-n*d);vec3 h_world=vec3(inv_model*to_icrs*vec4(h_model,1.f));h_world=check_inversed_longitude(h_world);vec2 h_clip=world2clip_mercator(h_world);return length(pos_clip-h_clip)*2.;}float d_isolat(vec3 pos_model,float delta){float y=atan(pos_model.y,length(pos_model.xz));float d=abs(y-delta);return d;}float grid_alpha(vec3 p){float v=1e10;float delta=asin(p.y);float theta=atan(p.x,p.z);float m=0.;float mdist=10.;for(int i=0;i<num_meridians;i++){float tmp=meridians[i];if(tmp>PI){tmp-=2.*PI;}float d=abs(theta-tmp);if(d<mdist){mdist=d;m=tmp;}}float par=0.;float pdist=10.;for(int i=0;i<num_parallels;i++){float d=abs(delta-parallels[i]);if(d<pdist){pdist=d;par=parallels[i];}}v=min(d_isolon(p,m),v);v=min(d_isolat(p,par),v);float eps=3.*czf/window_size.x;return smoothstep(eps,2.*eps,v);}void main(){vec4 transparency=vec4(0.f,0.f,0.f,0.f);vec3 pos_world=clip2world_mercator(pos_clip);pos_world=check_inversed_longitude(pos_world);vec3 pos_model=vec3(to_galactic*model*vec4(pos_world,1.f));float alpha=grid_alpha(pos_model);c=mix(color,transparency,alpha);}";

      /***/
    },

    /***/ 1072: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;out vec4 c;in vec2 pos_clip;uniform vec4 color;uniform mat4 model;uniform mat4 inv_model;uniform mat4 to_icrs;uniform mat4 to_galactic;uniform float czf;uniform float meridians[20];uniform int num_meridians;uniform float parallels[10];uniform int num_parallels;uniform vec2 window_size;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}bool is_included_inside_projection(vec2 pos_clip_space){float px2=pos_clip_space.x*pos_clip_space.x;float py2=pos_clip_space.y*pos_clip_space.y;return(px2*0.25+py2)<=0.25;}vec3 clip2world_mollweide(vec2 pos_clip_space){if(!is_included_inside_projection(pos_clip_space)){discard;}float y2=pos_clip_space.y*pos_clip_space.y;float k=sqrt(1.-4.*y2);float theta=PI*pos_clip_space.x/k;float delta=asin((2.*asin(2.*pos_clip_space.y)+4.*pos_clip_space.y*k)/PI);return vec3(sin(theta)*cos(delta),sin(delta),cos(theta)*cos(delta));}float d_isolon(vec3 pos_model,float theta){vec3 n=vec3(cos(theta),0.,-sin(theta));vec3 e_xz=vec3(-n.z,0.,n.x);if(dot(pos_model,e_xz)<0.){return 1e3;}float d=abs(dot(n,pos_model));vec3 h_model=normalize(pos_model-n*d);vec3 h_world=vec3(inv_model*to_icrs*vec4(h_model,1.f));h_world=check_inversed_longitude(h_world);vec2 h_clip=world2clip_mollweide(h_world);return length(pos_clip-h_clip)*2.;}float d_isolat(vec3 pos_model,float delta){float y=atan(pos_model.y,length(pos_model.xz));float d=abs(y-delta);return d;}float grid_alpha(vec3 p){float v=1e10;float delta=asin(p.y);float theta=atan(p.x,p.z);float m=0.;float mdist=10.;for(int i=0;i<num_meridians;i++){float tmp=meridians[i];if(tmp>PI){tmp-=2.*PI;}float d=abs(theta-tmp);if(d<mdist){mdist=d;m=tmp;}}float par=0.;float pdist=10.;for(int i=0;i<num_parallels;i++){float d=abs(delta-parallels[i]);if(d<pdist){pdist=d;par=parallels[i];}}v=min(d_isolon(p,m),v);v=min(d_isolat(p,par),v);float eps=3.*czf/window_size.x;return smoothstep(eps,2.*eps,v);}void main(){vec4 transparency=vec4(0.f,0.f,0.f,0.f);vec3 pos_world=clip2world_mollweide(pos_clip);pos_world=check_inversed_longitude(pos_world);vec3 pos_model=vec3(to_galactic*model*vec4(pos_world,1.f));float alpha=grid_alpha(pos_model);c=mix(color,transparency,alpha);}";

      /***/
    },

    /***/ 4300: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;out vec4 c;in vec2 pos_clip;uniform vec4 color;uniform mat4 model;uniform mat4 inv_model;uniform mat4 to_icrs;uniform mat4 to_galactic;uniform float czf;uniform float meridians[20];uniform int num_meridians;uniform float parallels[10];uniform int num_parallels;uniform vec2 window_size;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873737090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}vec3 clip2world_orthographic(vec2 pos_clip_space){float z=1.f-dot(pos_clip_space,pos_clip_space);if(z>0.f){return vec3(pos_clip_space.x,pos_clip_space.y,sqrt(z));}else{discard;}}float d_isolon(vec3 pos_model,float theta){vec3 n=vec3(cos(theta),0.,-sin(theta));vec3 e_xz=vec3(-n.z,0.,n.x);if(dot(pos_model,e_xz)<0.){return 1e3;}float d=abs(dot(n,pos_model));vec3 h_model=normalize(pos_model-n*d);vec3 h_world=vec3(inv_model*to_icrs*vec4(h_model,1.f));h_world=check_inversed_longitude(h_world);vec2 h_clip=world2clip_orthographic(h_world);return length(pos_clip-h_clip)*2.;}float d_isolat(vec3 pos_model,float delta){float y=atan(pos_model.y,length(pos_model.xz));float d=abs(y-delta);return d*2.;}float grid_alpha(vec3 p){float v=1e10;float delta=asin(p.y);float theta=atan(p.x,p.z);float m=0.;float mdist=10.;for(int i=0;i<num_meridians;i++){float tmp=meridians[i];if(tmp>PI){tmp-=2.*PI;}float d=abs(theta-tmp);if(d<mdist){mdist=d;m=tmp;}}float par=0.;float pdist=10.;for(int i=0;i<num_parallels;i++){float d=abs(delta-parallels[i]);if(d<pdist){pdist=d;par=parallels[i];}}v=min(d_isolon(p,m),v);v=min(d_isolat(p,par),v);float eps=3.*czf/window_size.x;return smoothstep(eps,2.*eps,v);}void main(){vec4 transparency=vec4(0.f,0.f,0.f,0.f);vec3 pos_world=clip2world_orthographic(pos_clip);pos_world=check_inversed_longitude(pos_world);vec3 pos_model=vec3(to_galactic*model*vec4(pos_world,1.f));float alpha=grid_alpha(pos_model);c=mix(color,transparency,alpha);}";

      /***/
    },

    /***/ 1468: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;out vec4 c;in vec2 pos_clip;uniform vec4 color;uniform mat4 model;uniform mat4 inv_model;uniform mat4 to_icrs;uniform mat4 to_galactic;uniform float czf;uniform float meridians[20];uniform int num_meridians;uniform float parallels[10];uniform int num_parallels;uniform vec2 window_size;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}vec3 clip2world_gnomonic(vec2 pos_clip_space){float x_2d=pos_clip_space.x*PI;float y_2d=pos_clip_space.y*PI;float r=x_2d*x_2d+y_2d*y_2d;float z=sqrt(1.+r);return vec3(z*x_2d,z*y_2d,z);}float d_isolon(vec3 pos_model,float theta){vec3 n=vec3(cos(theta),0.,-sin(theta));vec3 e_xz=vec3(-n.z,0.,n.x);if(dot(pos_model,e_xz)<0.){return 1e3;}float d=abs(dot(n,pos_model));vec3 h_model=normalize(pos_model-n*d);vec3 h_world=vec3(inv_model*to_icrs*vec4(h_model,1.f));h_world=check_inversed_longitude(h_world);vec2 h_clip=world2clip_gnomonic(h_world);return length(pos_clip-h_clip)*2.;}float d_isolat(vec3 pos_model,float delta){float y=atan(pos_model.y,length(pos_model.xz));float d=abs(y-delta);return d;}float grid_alpha(vec3 p){float v=1e10;float delta=asin(p.y);float theta=atan(p.x,p.z);float m=0.;float mdist=10.;for(int i=0;i<num_meridians;i++){float tmp=meridians[i];if(tmp>PI){tmp-=2.*PI;}float d=abs(theta-tmp);if(d<mdist){mdist=d;m=tmp;}}float par=0.;float pdist=10.;for(int i=0;i<num_parallels;i++){float d=abs(delta-parallels[i]);if(d<pdist){pdist=d;par=parallels[i];}}v=min(d_isolon(p,m),v);v=min(d_isolat(p,par),v);float eps=3.*czf/window_size.x;return smoothstep(eps,2.*eps,v);}void main(){vec4 transparency=vec4(0.f,0.f,0.f,0.f);vec3 pos_world=clip2world_gnomonic(pos_clip);pos_world=check_inversed_longitude(pos_world);vec3 pos_model=normalize(vec3(to_galactic*model*vec4(pos_world,1.f)));float alpha=grid_alpha(pos_model);c=mix(color,transparency,alpha);}";

      /***/
    },

    /***/ 3557: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision mediump int;layout(location=0)in vec2 ndc_pos;layout(location=1)in vec3 uv_start;layout(location=2)in vec3 uv_end;layout(location=3)in float time_tile_received;layout(location=4)in float m0;layout(location=5)in float m1;out vec3 frag_uv_start;out vec3 frag_uv_end;out float frag_blending_factor;out float m_start;out float m_end;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform float current_time;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){gl_Position=vec4(ndc_pos,0.,1.);frag_uv_start=uv_start;frag_uv_end=uv_end;frag_blending_factor=min((current_time-time_tile_received)/500.,1.);m_start=m0;m_end=m1;}";

      /***/
    },

    /***/ 3106: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision mediump int;layout(location=0)in vec2 ndc_pos;layout(location=1)in vec3 uv_start;layout(location=2)in vec3 uv_end;layout(location=3)in float time_tile_received;layout(location=4)in float m0;layout(location=5)in float m1;out vec3 frag_uv_start;out vec3 frag_uv_end;out float frag_blending_factor;out float m_start;out float m_end;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform float current_time;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sqn(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){gl_Position=vec4(ndc_pos,0.,1.);frag_uv_start=uv_start;frag_uv_end=uv_end;frag_blending_factor=min((current_time-time_tile_received)/500.,1.);m_start=m0;m_end=m1;}";

      /***/
    },

    /***/ 7378: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp isampler2D;precision mediump int;in vec3 frag_uv_start;in vec3 frag_uv_end;in float frag_blending_factor;in float m_start;in float m_end;out vec4 out_frag_color;uniform float opacity;uniform sampler2D tex1;uniform sampler2D tex2;uniqorm sampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}vec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return vec4(0.,1.,0.,1.);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_color_from_texture(vec3 UV){return get_pixels(UV);}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));vec4 color=get_pixels(uv);float x=color.r;float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha)*color.a,vec4(0.),float(x==blank||isnan(x)));}uniform vec4 C;uniform float K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));vec4 color=get_pixels(uv);float x=color.r;float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a*color.a),vec4(0.),float(x==blank||isnan(x)));}void main(){vec4 color_start=get_color_from_texture(frag_uv_start);vec4 color_end=get_color_from_texture(frag_uv_end);out_frag_color=mix(color_start,color_end,frag_blending_factor);out_frag_color.a=opacity*out_frag_color.a;}";

      /***/
    },

    /***/ 3414: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision mediump int;layout(location=0)in vec2 ndc_pos;layout(location=1)in vec3 uv_start;layout(location=2)in vec3 uv_end;layout(location=3)in float time_tile_received;layout(location=4)in float m0;layout(location=5)in float m1;out vec3 frag_uv_start;out vec3 frag_uv_end;out float frag_blending_factor;out float m_start;out float m_end;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform float current_time;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){gl_Position=vec4(ndc_pos,0.,1.);frag_uv_start=uv_start;frag_uv_end=uv_end;frag_blending_factor=min((current_time-time_tile_received)/500.,1.);m_start=m0;m_end=m1;}";

      /***/
    },

    /***/ 1258: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp isampler2D;precision mediump int;in vec3 frag_uv_start;in vec3 frag_uv_end;in float frag_blending_factor;in float m_start;in float m_end;out vec4 out_frag_color;uniform sampler2D tex1;uniform sampler2D tex2;uniform sampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}vec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return vec4(0.,1.,0.,1.);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_color_from_texture(vec3 UV){return get_pixels(UV);}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));vec4 color=get_pixels(uv);float x=color.r;float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha)*color.a,vec4(0.),float(x==blank||isnan(x)));}uniform vec4 C;uniform mloat K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));vec4 color=get_pixels(uv);float x=color.r;float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a*color.a),vec4(0.),float(x==blank||isnan(x)));}uniform float opacity;vec4 get_color(vec3 uv,float empty){vec4 color=mix(get_color_from_grayscale_texture(uv),vec4(0.),empty);return color;}void main(){vec4 color_start=get_color(frag_uv_start,m_start);vec4 color_end=get_color(frag_uv_end,m_end);out_frag_color=mix(color_start,color_end,frag_blending_factor);out_frag_color.a=out_frag_color.a*opacity;}";

      /***/
    },

    /***/ 37: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp isampler2D;precision mediump int;in vec3 frag_uv_start;in vec3 frag_uv_end;in float frag_blending_factor;in float m_start;in float m_end;out vec4 out_frag_color;uniform isampler2D tex1;uniform isampler2D tex2;uniform isampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}ivec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return ivec4(0,0,0,1);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha),vec4(0.),float(x==blank));}uniform vec4 C;uniform float K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a),vec4(0.),float(x==blank));}uniform float opacity;vec4 get_color(vec3 uv,float empty){vec4 color=mix(get_color_from_grayscale_texture(uv),vec4(0.),empty);return color;}void main(){vec4 color_start=get_color(frag_uv_start,m_start);vec4 color_end=get_color(frag_uv_end,m_end);out_frag_color=mix(color_start,color_end,frag_blending_factor);out_frag_color.a=out_frag_color.a*opacity;}";

      /***/
    },

    /***/ 594: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp isampler2D;precision highp usampler2D;precision mediump int;in vec3 frag_uv_start;in vec3 frag_uv_end;in float frag_blending_factor;in float m_start;in float m_end;out vec4 out_frag_color;uniform usampler2D tex1;uniform usampler2D tex2;uniform usampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}uvec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return uvec4(0,0,0,1);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha),vec4(0.),float(x==blank));}uniform vec4 C;uniform float K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a),vec4(0.),float(x==blank));}uniform float opacity;vec4 get_color(vec3 uv,float empty){vec4 color=mix(get_color_from_grayscale_texture(uv),vec4(0.),empty);return color;}void main(){vec4 color_start=get_color(frag_uv_start,m_start);vec4 color_end=get_color(frag_uv_end,m_end);out_frag_color=mix(color_start,color_end,frag_blending_factor);out_frag_color.a=out_frag_color.a*opacity;}";

      /***/
    },

    /***/ 6593: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp isampler2D;precision mediump int;in vec3 frag_uv_start;in vec3 frau_uv_end;in float frag_blending_factor;in float m_start;in float m_end;out vec4 out_frag_color;uniform sampler2D tex1;uniform sampler2D tex2;uniform sampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}vec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return vec4(0.,1.,0.,1.);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_color_from_texture(vec3 UV){return get_pixels(UV);}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));vec4 color=get_pixels(uv);float x=color.r;float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha)*color.a,vec4(0.),float(x==blank||isnan(x)));}uniform vec4 C;uniform float K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));vec4 color=get_pixels(uv);float x=color.r;float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a*color.a),vec4(0.),float(x==blank||isnan(x)));}uniform float opacity;void main(){vec4 color_start=get_colormap_from_grayscale_texture(frag_uv_start);vec4 color_end=get_colormap_from_grayscale_texture(frag_uv_end);out_frag_color=mix(color_start,color_end,frag_blending_factor);out_frag_color.a=out_frag_color.a*opacity;}";

      /***/
    },

    /***/ 8567: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp isampler2D;precision mediump int;in vec3 frag_uv_start;in vec3 frag_uv_end;in float frag_blending_factor;in float m_start;in float m_end;out vec4 out_frag_color;uniform isampler2D tex1;uniform isampler2D tex2;uniform isampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}ivec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return ivec4(0,0,0,1);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha),vec4(0.),float(x==blank));}uniform vec4 C;uniform float K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a),vec4(0.),float(x==blank));}uniform float opacity;void main(){vec4 color_start=get_colormap_from_grayscale_texture(frag_uv_start);vec4 color_end=get_colormap_from_grayscale_texture(frag_uv_end);out_frag_color=mix(color_start,color_end,frag_blending_factor);out_frag_color.a=out_frag_color.a*opacity;}";

      /***/
    },

    /***/ 3206: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp isampler2D;precision highp usampler2D;precision mediump int;in vec3 frag_uv_start;in vec3 frag_uv_end;in float frag_blending_factor;in float m_start;in float m_end;out vec4 out_frag_color;uniform usampler2D tex1;uniform usampler2D tex2;uniform usampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}uvec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return uvec4(0,0,0,1);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha),vec4(0.),float(x==blank));}uniform vec4 C;uniform float K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a),vec4(0.),float(x==blank));}uniform float opacity;void main(){vec4 color_start=get_colormap_from_grayscale_texture(frag_uv_start);vec4 color_end=get_colormap_from_grayscale_texture(frag_uv_end);out_frag_color=mix(color_start,color_end,frag_blending_factor);out_frag_color.a=out_frag_color.a*opacity;}";

      /***/
    },

    /***/ 1780: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision mediump int;layout(location=0)in vec2 ndc_pos;layout(location=1)in vec3 uv_start;layout(location=2)in vec3 uv_end;layout(location=3)in float time_tile_received;layout(location=4)in float m0;layout(location=5)in float m1;out vec3 frag_uv_start;out vec3 frag_uv_end;out float frag_blending_factor;out float m_start;out float m_end;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform float current_time;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}rloat x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){gl_Position=vec4(ndc_pos,0.,1.);frag_uv_start=uv_start;frag_uv_end=uv_end;frag_blending_factor=min((current_time-time_tile_received)/500.,1.);m_start=m0;m_end=m1;}";

      /***/
    },

    /***/ 5022: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision mediump int;layout(location=0)in vec2 ndc_pos;layout(location=1)in vec3 uv_start;layout(location=2)in vec3 uv_end;layout(location=3)in float time_tile_received;layout(location=4)in float m0;layout(location=5)in float m1;out vec3 frag_uv_start;out vec3 frag_uv_end;out float frag_blending_factor;out float m_start;out float m_end;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform float current_time;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){gl_Position=vec4(ndc_pos,0.,1.);frag_uv_start=uv_start;frag_uv_end=uv_end;frag_blending_factor=min((current_time-time_tile_received)/500.,1.);m_start=m0;m_end=m1;}";

      /***/
    },

    /***/ 3313: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision mediump int;layout(location=0)in vec2 ndc_pos;layout(location=1)in vec3 uv_start;layout(location=2)in vec3 uv_end;layout(location=3)in float time_tile_received;layout(location=4)in float m0;layout(location=5)in float m1;out vec3 frag_uv_start;out vec3 frag_uv_end;out float frag_blending_factor;out float m_start;out float m_end;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform float current_time;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;ind k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){gl_Position=vec4(ndc_pos,0.,1.);frag_uv_start=uv_start;frag_uv_end=uv_end;frag_blending_factor=min((current_time-time_tile_received)/500.,1.);m_start=m0;m_end=m1;}";

      /***/
    },

    /***/ 2620: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision mediump int;layout(location=0)in vec2 ndc_pos;layout(location=1)in vec3 uv_start;layout(location=2)in vec3 uv_end;layout(location=3)in float time_tile_received;layout(location=4)in float m0;layout(location=5)in float m1;out vec3 frag_uv_start;out vec3 frag_uv_end;out float frag_blending_factor;out float m_start;out float m_end;uniform mat4 inv_model;uniform vec2 ndc_to_clip;uniform float czf;uniform float current_time;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}ver2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){gl_Position=vec4(ndc_pos,0.,1.);frag_uv_start=uv_start;frag_uv_end=uv_end;frag_blending_factor=min((current_time-time_tile_received)/500.,1.);m_start=m0;m_end=m1;}";

      /***/
    },

    /***/ 5943: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp usampler2D;precision highp isampler2D;precision highp int;out vec4 out_frag_color;uniform vec4 font_color;void main(){out_frag_color=font_color;}";

      /***/
    },

    /***/ 5020: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp int;layout(location=0)in vec2 pos_clip_space;uniform vec2 ndc_to_clip;uniform float czf;void main(){gl_Position=vec4(pos_clip_space/(ndc_to_clip*czf),0.,1.);}";

      /***/
    },

    /***/ 7935: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp usampler2D;precision highp isampler2D;precision highp int;in vec2 out_clip_pos;in vec3 frag_pos;out vec4 out_frag_color;struct Tile{int uniq;int texture_idx;float start_time;float empty;};uniform Tile textures_tiles[12];uniform int num_tiles;uniform sampler2D tex1;uniform sampler2D tex2;uniform sampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}vec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return vec4(0.,1.,0.,1.);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_color_from_texture(vec3 UV){return get_pixels(UV);}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));vec4 color=get_pixels(uv);float x=color.r;float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha)*color.a,vec4(0.),float(x==blank||isnan(x)));}uniform vec4 C;uniform float K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));vec4 color=get_pixels(uv);float x=color.r;float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a*color.a),vec4(0.),float(x==blank||isnan(x)));}const float TWICE_PI=6.28318530718;const float PI=3.141592653589793;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;int quarter(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int q=(x_neg+y_neg)|(y_neg<<1);return q;}float xpm1(vec2 p){bool x_neg=(p.x<0.);bool y_neg=(p.y<0.);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return 1.-x02;}else{return x02-1.;}}float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.0f-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1f){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}int ij2z(int i,int j){int i4=i|(j<<2);int j4=(i4^(i4>>1))&0x22222222;int i5=i4^j4^(j4<<1);return i5;}struct HashDxDy{int idx;float dx;float dy;};uniform sampler2D ang2pixd;HashDxDy hash_with_dxdy2(vec2 radec){vec2 aa=vec2(radec.x/TWICE_PI+1.,(radec.y/PI)+0.5);vec3 v=texture(ang2pixd,aa).rgb;return HashDxDy(int(v.x*255.),v.y,v.z);}HashDxDy hash_with_dxdy(int depth,vec3 p){int nside=1<<depth;float half_nside=float(nside)*0.5;float x_pm1=xpm1(p.xy);int q=quarter(p.xy);int d0h=0;vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,2.-sqrt_3_one_min_z);d0h=q;}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,sqrt_3_one_min_z);d0h=q+8;}else{float y_pm1=p.z*TRANSITION_Z_INV;int q01=int(x_pm1>y_pm1);int q12=int(x_pm1>=-y_pm1);int q03=1-q12;int q1=q01&q12;p_proj=vec2(x_pm1-float(q01+q12-1),y_pm1+float(q01+q03));d0h=((q01+q03)<<2)+((q+q1)&3);}fdoat x=(half_nside*(p_proj.x+p_proj.y));float y=(half_nside*(p_proj.y-p_proj.x));int i=int(x);int j=int(y);return HashDxDy((d0h<<(depth<<1))+ij2z(i,j),x-float(i),y-float(j));}uniform float opacity;vec4 get_tile_color(vec3 pos){HashDxDy result=hash_with_dxdy(0,pos.zxy);int idx=result.idx;vec2 uv=vec2(result.dy,result.dx);Tile tile=textures_tiles[idx];int idx_texture=tile.texture_idx>>6;int off=tile.texture_idx&0x3F;float idx_row=float(off>>3);float idx_col=float(off&0x7);vec2 offset=(vec2(idx_col,idx_row)+uv)*0.125;vec3 UV=vec3(offset,float(idx_texture));vec4 color=get_color_from_texture(UV);return color;}uniform sampler2D position_tex;uniform mat4 model;void main(){vec2 uv=out_clip_pos*0.5+0.5;vec4 c=get_tile_color(normalize(frag_pos));out_frag_color=vec4(c.rgb,opacity*c.a);}";

      /***/
    },

    /***/ 4215: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp usampler2D;precision highp isampler2D;precision highp int;in vec2 out_clip_pos;in vec3 frag_pos;out vec4 out_frag_color;struct Tile{int uniq;int texture_idx;float start_time;float empty;};uniform Tile textures_tiles[12];uniform sampler2D tex1;uniform sampler2D tex2;uniform sampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}vec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return vec4(0.,1.,0.,1.);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_color_from_texture(vec3 UV){return get_pixels(UV);}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));vec4 color=get_pixels(uv);float x=color.r;float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha)*color.a,vec4(0.),float(x==blank||isnan(x)));}uniform vec4 C;uniform float K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));vec4 color=get_pixels(uv);float x=color.r;float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a*color.a),vec4(0.),float(x==blank||isnan(x)));}const float TWICE_PI=6.28318530718;const float PI=3.141592653589793;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;int quarter(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int q=(x_neg+y_neg)|7y_neg<<1);return q;}float xpm1(vec2 p){bool x_neg=(p.x<0.);bool y_neg=(p.y<0.);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return 1.-x02;}else{return x02-1.;}}float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.0f-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1f){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}int ij2z(int i,int j){int i4=i|(j<<2);int j4=(i4^(i4>>1))&0x22222222;int i5=i4^j4^(j4<<1);return i5;}struct HashDxDy{int idx;float dx;float dy;};uniform sampler2D ang2pixd;HashDxDy hash_with_dxdy2(vec2 radec){vec2 aa=vec2(radec.x/TWICE_PI+1.,(radec.y/PI)+0.5);vec3 v=texture(ang2pixd,aa).rgb;return HashDxDy(int(v.x*255.),v.y,v.z);}HashDxDy hash_with_dxdy(int depth,vec3 p){int nside=1<<depth;float half_nside=float(nside)*0.5;float x_pm1=xpm1(p.xy);int q=quarter(p.xy);int d0h=0;vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,2.-sqrt_3_one_min_z);d0h=q;}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,sqrt_3_one_min_z);d0h=q+8;}else{float y_pm1=p.z*TRANSITION_Z_INV;int q01=int(x_pm1>y_pm1);int q12=int(x_pm1>=-y_pm1);int q03=1-q12;int q1=q01&q12;p_proj=vec2(x_pm1-float(q01+q12-1),y_pm1+float(q01+q03));d0h=((q01+q03)<<2)+((q+q1)&3);}float x=(half_nside*(p_proj.x+p_proj.y));float y=(half_nside*(p_proj.y-p_proj.x));int i=int(x);int j=int(y);return HashDxDy((d0h<<(depth<<1))+ij2z(i,j),x-float(i),y-float(j));}uniform float opacity;vec4 get_tile_color(vec3 pos){HashDxDy result=hash_with_dxdy(0,pos.zxy);int idx=result.idx;vec2 uv=vec2(result.dy,result.dx);Tile tile=textures_tiles[idx];int idx_texture=tile.texture_idx>>6;int off=tile.texture_idx&0x3F;float idx_row=float(off>>3);float idx_col=float(off&0x7);vec2 offset=(vec2(idx_col,idx_row)+uv)*0.125;vec3 UV=vec3(offset,float(idx_texture));vec4 color=get_color_from_grayscale_texture(UV);color.a*=(1.-tile.empty);return color;}uniform sampler2D position_tex;uniform mat4 model;void main(){vec4 c=get_tile_color(normalize(frag_pos));out_frag_color=c;out_frag_color.a=out_frag_color.a*opacity;}";

      /***/
    },

    /***/ 757: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp usampler2D;precision highp isampler2D;precision highp int;in vec2 out_clip_pos;in vec3 frag_pos;out vec4 out_frag_color;struct Tile{int uniq;int texture_idx;float start_time;float empty;};uniform Tile textures_tiles[12];struct TileColor{Tile tile;vec4 color;bool found;};uniform isampler2D tex1;uniform isampler2D tex2;uniform isampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}ivec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return ivec4(0,0,0,1);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha),vec4(0.),float(x==blank));}uniform vec4 C;uniform float K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a),vec4(0.),float(x==blank));}const float TWICE_PI=6.28318530718;const float PI=3.141592653589793;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;int quarter(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int q=(x_neg+y_neg)|(y_neg<<1);return q;}float xpm1(vec2 p){bool x_neg=(p.x<0.);bool y_neg=(p.y<0.);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return 1.-x02;}else{return x02-1.;}}float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.0f-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1f){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}int ij2z(int i,int j){int i4=i|(j<<2);int j4=(i4^(i4>>1))&0x22222222;int i5=i4^j4^(j4<<1);return i5;}struct HashDxDy{int idx;float dx;float dy;};uniform sampler2D ang2pixd;HashDxDy hash_with_dxdy2(vec2 radec){vec2 aa=vec2(radec.x/TWICE_PI+1.,(radec.y/PI)+0.5);vec3 v=texture(ang2pixd,aa).rgb;return HashDxDy(int(v.x*255.),v.y,v.z);}HashDxDy hash_with_dxdy(int depth,vec3 p){int nside=1<<depth;float half_nside=float(nside)*0.5;float x_pm1=xpm1(p.xy);int q=quarter(p.xy);int d0h=0;vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,2.-sqrt_3_one_min_z);d0h=q;}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,sqrt_3_one_min_z);d0h=q+8;}else{float y_pm1=p.z*TRANSITION_Z_INV;int q01=int(x_pm1>y_pm1);int q12=int(x_pm1>=-y_pm1);int q03=1-q12;int q1=q01&q12;p_proj=vec2(x_pm1-float(q01+q12-1),y_pm1+float(q01+q03));d0h=((q01+q03)<<2)+((q+q1)&3);}float x=(half_nside*(p_proj.x+p_proj.y));float y=(half_nside*(p_proj.y-p_proj.x));int i=int(x);int j=int(y);return HashDxDy((d0h<<(depth<<1))+ij2z(i,j),x-float(i),y-float(j));}uniform float opacity;vec4 get_tile_color(vec3 pos){HashDxDy result=hash_with_dxdy(0,pos.zxy);int idx=result.idx;vec2 uv=vec2(result.dy,result.dx);Tile tile=textures_tiles[idx];int idx_texture=tile.texture_idx>>6;int off=tile.texture_idx&0x3F;float idx_row=float(off>>3);float idx_col=float(off&0x7);vec2 offset=(vec2(idx_col,idx_row)+uv)*0.125;vec3 UV=vec3(offset,float(idx_texture));vec4 color=get_color_from_grayscale_texture(UV);color.a*=(1.-tile.empty);return color;}uniform sampler2D position_tex;uniform mat4 model;void main(){vec4 c=get_tile_color(frag_pos);out_frag_color=c;out_frag_color.a=out_frag_color.a*opacity;}";

      /***/
    },

    /***/ 5493: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp usampler2D;precision highp isampler2D;precision highp int;in vec2 out_clip_pos;in vec3 frag_pos;out vec4 out_frag_color;struct Tile{int uniq;int texture_idx;float start_time;float empty;};uniform Tile textures_tiles[12];struct TileColor{Tile tile;vec4 color;bool found;};uniform usampler2D tex1;uniform usampler2D tex2;uniform usampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}uvec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return uvec4(0,0,0,1);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha),vec4(0.),float(x==blank));}uniform vec4 C;uniform float K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a),vec4(0.),float(x==blank));}const float TWICE_PI=6.28318530718;const float PI=3.141592653589793;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;int quarter(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int q=(x_neg+y_neg)|(y_neg<<1);return q;}float xpm1(vec2 p){bool x_neg=(p.x<0.);bool y_neg=(p.y<0.);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return 1.-x02;}else{return x02-1.;}}float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.0f-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1f){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}int ij2z(int i,int j){int i4=i|(j<<2);int j4=(i4^(i4>>1))&0x22222222;int i5=i4^j4^(j4<<1);return i5;}struct HashDxDy{int idx;float dx;float dy;};uniform sampler2D ang2pixd;HashDxDy hash_with_dxdy2(vec2 radec){vec2 aa=vec2(radec.x/TWICE_PI+1.,(radec.y/PI)+0.5);vec3 v=texture(ang2pixd,aa).rgb;return HashDxDy(int(v.x*255.),v.y,v.z);}HashDxDy hash_with_dxdy(int depth,vec3 p){int nside=1<<depth;float half_nside=float(nside)*0.5;float x_pm1=xpm1(p.xy);int q=quarter(p.xy);int d0h=0;vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,2.-sqrt_3_one_min_z);d0h=q;}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,sqrt_3_one_min_z);d0h=q+8;}else{float y_pm1=p.z*TRANSITION_Z_INV;int q01=int(x_pm1>y_pm1);int q12=int(x_pm1>=-y_pm1);int q03=1-q12;int q1=q01&q12;p_proj=vec2(x_pm1-float(q01+q12-1),y_pm1+float(q01+q03));d0h=((q01+q03)<<2)+((q+q1)&3);}float x=(half_nside*(p_proj.x+p_proj.y));float y=(half_nside*(p_proj.y-p_proj.x));int i=int(x);int j=int(y);return HashDxDy((d0h<<(depth<<1))+ij2z(i,j),x-float(i),y-float(j));}uniform float opacity;vec4 get_tile_color(vec3 pos){HashDxDy result=hash_with_dxdy(0,pos.zxy);int idx=result.idx;vec2 uv=vec2(result.dy,result.dx);Tile tile=textures_tiles[idx];int idx_texture=tile.texture_idx>>6;int off=tile.texture_idx&0x3F;float idx_row=float(off>>3);float idx_col=float(off&0x7);vec2 offset=(vec2(idx_col,idx_row)+uv)*0.125;vec3 UV=vec3(offset,float(idx_texture));vec4 color=get_color_from_grayscale_texture(UV);color.a*=(1.-tile.empty);return color;}uniform sampler2D position_tex;uniform mat4 model;void main(){vec4 c=get_tile_color(frag_pos);out_frag_color=c;out_frag_color.a=out_frag_color.a*opacity;}";

      /***/
    },

    /***/ 2187: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp usampler2D;precision highp isampler2D;precision highp int;in vec3 frag_pos;in vec2 out_clip_pos;out vec4 out_frag_color;struct Tile{int uniq;int texture_idx;float start_time;float empty;};uniform Tile textures_tiles[12];uniform float opacity;struct TileColor{Tile tile;vec4 color;bool found;};uniform sampler2D tex1;uniform sampler2D tex2;uniform sampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}vec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return vec4(0.,1.,0.,1.);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_color_from_texture(vec3 UV){return get_pixels(UV);}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));vec4 color=get_pixels(uv);float x=color.r;float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha)*color.a,vec4(0.),float(x==blank||isnan(x)));}uniform vec4 C;uniform float K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));vec4 color=get_pixels(uv);float x=color.r;float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a*color.a),vec4(0.),float(x==blank||isnan(x)));}const float TWICE_PI=6.28318530718;const float PI=3.141592653589793;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;int quarter(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int q=(x_neg+y_neg)|(y_neg<<1);return q;}float xpm1(vec2 p){bool x_neg=(p.x<0.);bool y_neg=(p.y<0.);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_nek){return 1.-x02;}else{return x02-1.;}}float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.0f-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1f){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}int ij2z(int i,int j){int i4=i|(j<<2);int j4=(i4^(i4>>1))&0x22222222;int i5=i4^j4^(j4<<1);return i5;}struct HashDxDy{int idx;float dx;float dy;};uniform sampler2D ang2pixd;HashDxDy hash_with_dxdy2(vec2 radec){vec2 aa=vec2(radec.x/TWICE_PI+1.,(radec.y/PI)+0.5);vec3 v=texture(ang2pixd,aa).rgb;return HashDxDy(int(v.x*255.),v.y,v.z);}HashDxDy hash_with_dxdy(int depth,vec3 p){int nside=1<<depth;float half_nside=float(nside)*0.5;float x_pm1=xpm1(p.xy);int q=quarter(p.xy);int d0h=0;vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,2.-sqrt_3_one_min_z);d0h=q;}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,sqrt_3_one_min_z);d0h=q+8;}else{float y_pm1=p.z*TRANSITION_Z_INV;int q01=int(x_pm1>y_pm1);int q12=int(x_pm1>=-y_pm1);int q03=1-q12;int q1=q01&q12;p_proj=vec2(x_pm1-float(q01+q12-1),y_pm1+float(q01+q03));d0h=((q01+q03)<<2)+((q+q1)&3);}float x=(half_nside*(p_proj.x+p_proj.y));float y=(half_nside*(p_proj.y-p_proj.x));int i=int(x);int j=int(y);return HashDxDy((d0h<<(depth<<1))+ij2z(i,j),x-float(i),y-float(j));}vec4 get_tile_color(vec3 pos){HashDxDy result=hash_with_dxdy(0,pos.zxy);int idx=result.idx;vec2 uv=vec2(result.dy,result.dx);Tile tile=textures_tiles[idx];int idx_texture=tile.texture_idx>>6;int off=tile.texture_idx&0x3F;float idx_row=float(off>>3);float idx_col=float(off&0x7);vec2 offset=(vec2(idx_col,idx_row)+uv)*0.125;vec3 UV=vec3(offset,float(idx_texture));vec4 color=get_colormap_from_grayscale_texture(UV);color.a*=(1.-tile.empty);return color;}uniform sampler2D position_tex;uniform mat4 model;void main(){vec4 c=get_tile_color(normalize(frag_pos));out_frag_color=c;out_frag_color.a=out_frag_color.a*opacity;}";

      /***/
    },

    /***/ 1726: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp usampler2D;precision highp isampler2D;precision highp int;in vec3 frag_pos;in vec2 out_clip_pos;out vec4 out_frag_color;struct Tile{int uniq;int texture_idx;float start_time;float empty;};uniform Tile textures_tiles[12];uniform float opacity;uniform isampler2D tex1;uniform isampler2D tex2;uniform isampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}ivec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return ivec4(0,0,0,1);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha),vec4(0.),float(x==blank));}uniform vec4 C;uniform float K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a),vec4(0.),float(x==blank));}const float TWICE_PI=6.28318530718;const float PI=3.141592653589793;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;int quarter(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int q=(x_neg+y_neg)|(y_neg<<1);return q;}float xpm1(vec2 p){bool x_neg=(p.x<0.);bool y_neg=(p.y<0.);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return 1.-x02;}else{return x02-1.;}}float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.0f-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1f){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}int ij2z(int i,int j){int i4=i|(j<<2);int j4=(i4^(i4>>1))&0x22222222;int i5=i4^j4^(j4<<1);return i5;}struct HashDxDy{int idx;float dx;float dy;};uniform sampler2D ang2pixd;HashDxDy hash_with_dxdy2(vec2 radec){vec2 aa=vec2(radec.x/TWICE_PI+1.,(radec.y/PI)+0.5);vec3 v=texture(ang2pixd,aa).rgb;return HashDxDy(int(v.x*255.),v.y,v.z);}HashDxDy hash_with_dxdy(int depth,vec3 p){int nside=1<<depth;float half_nside=float(nside)*0.5;float x_pm1=xpm1(p.xy);int q=quarter(p.xy);int d0h=0;vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,2.-sqrt_3_one_min_z);d0h=q;}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,sqrt_3_one_min_z);d0h=q+8;}else{float y_pm1=p.z*TRANSITION_Z_INV;int q01=int(x_pm1>y_pm1);int q12=int(x_pm1>=-y_pm1);int q03=1-q12;int q1=q01&q12;p_proj=vec2(x_pm1-float(q01+q12-1),y_pm1+float(q01+q03));d0h=((q01+q03)<<2)+((q+q1)&3);}float x=(half_nside*(p_proj.x+p_proj.y));float y=(half_nside*(p_proj.y-p_proj.x));int i=int(x);int j=int(y);return HashDxDy((d0h<<(depth<<1))+ij2z(i,j),x-float(i),y-float(j));}vec4 get_tile_color(vec3 pos){HashDxDy result=hash_with_dxdy(0,pos.zxy);int idx=result.idx;vec2 uv=vec2(result.dy,result.dx);Tile tile=textures_tiles[idx];int idx_texture=tile.texture_idx>>6;int off=tile.texture_idx&0x3F;float idx_row=float(off>>3);float idx_col=float(off&0x7);vec2 offset=(vec2(idx_col,idx_row)+uv)*0.125;vec3 UV=vec3(offset,float(idx_texture));vec4 color=get_colormap_from_grayscale_texture(UV);color.a*=(1.-tile.empty);return color;}uniform sampler2D position_tex;uniform mat4 model;void main(){vec4 c=get_tile_color(normalize(frag_pos));out_frag_color=c;out_frag_color.a=out_frag_color.a*opacity;}";

      /***/
    },

    /***/ 3090: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp sampler2D;precision highp usampler2D;precision highp isampler2D;precision highp int;in vec3 frag_pos;in vec2 out_clip_pos;out vec4 out_frag_color;struct Tile{int uniq;int texture_idx;float start_time;float empty;};uniform Tile textures_tiles[12];uniform float opacity;uniform usampler2D tex1;uniform usampler2D tex2;uniform usampler2D tex3;uniform int num_tex;uniform float scale;uniform float offset;uniform float blank;uniform float min_value;uniform float max_value;uniform int H;uniform float size_tile_uv;uniform int tex_storing_fits;uniform sampler2D colormaps;uniform float num_colormaps;uniform float colormap_id;uniform float reversed;vec4 colormap_f(float x){x=mix(x,1.-x,reversed);float id=(colormap_id+0.5)/num_colormaps;return texture(colormaps,vec2(x,id));}float linear_f(float x,float min_value,float max_value){return clamp((x-min_value)/(max_value-min_value),0.,1.);}float sqrt_f(float x,float min_value,float max_value){float a=linear_f(x,min_value,max_value);return sqrt(a);}float log_f(float x,float min_value,float max_value){float y=linear_f(x,min_value,max_value);float a=1000.;return log(a*y+1.)/log(a);}float asinh_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return asinh(10.*d)/3.;}float pow2_f(float x,float min_value,float max_value){float d=linear_f(x,min_value,max_value);return d*d;}float transfer_func(int H,float x,float min_value,float max_value){if(H==0){return linear_f(x,min_value,max_value);}else if(H==1){return sqrt_f(x,min_value,max_value);}else if(H==2){return log_f(x,min_value,max_value);}else if(H==3){return asinh_f(x,min_value,max_value);}else{return pow2_f(x,min_value,max_value);}}uvec4 get_pixels(vec3 uv){int idx_texture=int(uv.z);if(idx_texture==0){return texture(tex1,uv.xy);}else if(idx_texture==1){return texture(tex2,uv.xy);}else if(idx_texture==2){return texture(tex3,uv.xy);}else{return uvec4(0,0,0,1);}}vec3 reverse_uv(vec3 uv){uv.y=size_tile_uv+2.*size_tile_uv*floor(uv.y/size_tile_uv)-uv.y;return uv;}vec4 get_colormap_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(colormap_f(alpha),vec4(0.),float(x==blank));}uniform vec4 C;uniform float K;vec4 get_color_from_grayscale_texture(vec3 UV){vec3 uv=mix(UV,reverse_uv(UV),float(tex_storing_fits==1));float x=float(get_pixels(uv).r);float alpha=x*scale+offset;alpha=transfer_func(H,alpha,min_value,max_value);return mix(vec4(C.rgb*K*alpha,C.a),vec4(0.),float(x==blank));}const float TWICE_PI=6.28318530718;const float PI=3.141592653589793;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;int quarter(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int q=(x_neg+y_neg)|(y_neg<<1);return q;}float xpm1(vec2 p){bool x_neg=(p.x<0.);bool y_neg=(p.y<0.);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return 1.-x02;}else{return x02-1.;}}float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.0f-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1f){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}int ij2z(int i,int j){int i4=i|(j<<2);int j4=(i4^(i4>>1))&0x22222222;int i5=i4^j4^(j4<<1);return i5;}struct HashDxDy{int idx;float dx;float dy;};uniform sampler2D ang2pixd;HashDxDy hash_with_dxdy2(vec2 radec){vec2 aa=vec2(radec.x/TWICE_PI+1.,(radec.y/PI)+0.5);vec3 v=texture(ang2pixd,aa).rgb;return HashDxDy(int(v.x*255.),v.y,v.z);}HashDxDy hash_with_dxdy(int depth,vec3 p){int nside=1<<depth;float half_nside=float(nside)*0.5;float x_pm1=xpm1(p.xy);int q=quarter(p.xy);int d0h=0;vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,2.-sqrt_3_one_min_z);d0h=q;}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2(x_pm1*sqrt_3_one_min_z,sqrt_3_one_min_z);d0h=q+8;}else{float y_pm1=p.z*TRANSITION_Z_INV;int q01=int(x_pm1>y_pm1);int q12=int(x_pm1>=-y_pm1);int q03=1-q12;int q1=q01&q12;p_proj=vec2(x_pm1-float(q01+q12-1),y_pm1+float(q01+q03));d0h=((q01+q03)<<2)+((q+q1)&3);}float x=(half_nside*(p_proj.x+p_proj.y));float y=(half_nside*(p_proj.y-p_proj.x));int i=int(x);int j=int(y);return HashDxDy((d0h<<(depth<<1))+ij2z(i,j),x-float(i),y-float(j));}vec4 get_tile_color(vec3 pos){HashDxDy result=hash_with_dxdy(0,pos.zxy);int idx=result.idx;vec2 uv=vec2(result.dy,result.dx);Tile tile=textures_tiles[idx];int idx_texture=tile.texture_idx>>6;int off=tile.texture_idx&0x3F;float idx_row=float(off>>3);float idx_col=float(off&0x7);vec2 offset=(vec2(idx_col,idx_row)+uv)*0.125;vec3 UV=vec3(offset,float(idx_texture));vec4 color=get_colormap_from_grayscale_texture(UV);color.a*=(1.-tile.empty);return color;}uniform sampler2D position_tex;uniform mat4 model;void main(){vec4 c=get_tile_color(normalize(frag_pos));out_frag_color=c;out_frag_color.a=out_frag_color.a*opacity;}";

      /***/
    },

    /***/ 1783: /***/ (module) => {
      module.exports =
        "#version 300 es\nprecision highp float;precision highp int;layout(location=0)in vec2 pos_clip_space;out vec2 out_clip_pos;out vec3 frag_pos;uniform vec2 ndc_to_clip;uniform float czf;uniform mat4 model;uniform sampler2D position_tex;const float PI=3.1415926535897932384626433832795;const mat4 GAL2J2000=mat4(-0.4448296299195045,0.7469822444763707,0.4941094279435681,0.,-0.1980763734646737,0.4559837762325372,-0.8676661489811610,0.,-0.873437090247923,-0.4838350155267381,-0.0548755604024359,0.,0.,0.,0.,1.);const mat4 J20002GAL=mat4(-0.4448296299195045,-0.1980763734646737,-0.873437090247923,0.,0.7469822444763707,0.4559837762325372,-0.4838350155267381,0.,0.4941094279435681,-0.8676661489811610,-0.0548755604024359,0.,0.,0.,0.,1.);vec2 world2clip_orthographic(vec3 p){return vec2(-p.x,p.y);}vec2 world2clip_aitoff(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float theta_by_two=theta*0.5;float alpha=acos(cos(delta)*cos(theta_by_two));float inv_sinc_alpha=1.;if(alpha>1e-4){inv_sinc_alpha=alpha/sin(alpha);}float x=2.*inv_sinc_alpha*cos(delta)*sin(theta_by_two);float y=inv_sinc_alpha*sin(delta);return vec2(x/PI,y/PI);}vec2 world2clip_mollweide(vec3 p){int max_iter=10;float delta=asin(p.y);float theta=atan(p.x,p.z);float cst=PI*sin(delta);float phi=delta;float dx=phi+sin(phi)-cst;int k=0;while(abs(dx)>1e-6&&k<max_iter){phi=phi-dx/(1.+cos(phi));dx=phi+sin(phi)-cst;k=k+1;}phi=phi*0.5;float x=(-theta/PI)*cos(phi);float y=0.5*sin(phi);return vec2(x,y);}vec2 world2clip_mercator(vec3 p){float delta=asin(p.y);float theta=atan(-p.x,p.z);float x=theta/PI;float y=asinh(tan(delta/PI));return vec2(x,y);}float arc_sinc(float x){if(x>1e-4){return asin(x)/x;}else{float x2=x*x;return 1.+x2*(1.+x2*9./20.)/6.;}}vec2 world2clip_arc(vec3 p){if(p.z>-1.){float r=length(p.xy);if(p.z>0.){r=arc_sinc(r);}else{r=acos(p.z)/r;}float x=p.x*r;float y=p.y*r;return vec2(-x/PI,y/PI);}else{return vec2(1.,0.);}}vec2 world2clip_gnomonic(vec3 p){if(p.z<=1e-2){return vec2(1.,0.);}else{return vec2((-p.x/p.z)/PI,(p.y/p.z)/PI);}}const float TWICE_PI=6.28318530718;const float FOUR_OVER_PI=1.27323954474;const float TRANSITION_Z=0.66666666666;const float TRANSITION_Z_INV=1.5;float one_minus_z_pos(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return 1.-p.z;}float one_minus_z_neg(vec3 p){float d2=dot(p.xy,p.xy);if(d2<1e-1){return d2*(0.5+d2*(0.125+d2*(0.0625+d2*(0.0390625+d2*0.02734375))));}return p.z+1.;}vec2 xpm1_and_offset(vec2 p){int x_neg=int(p.x<0.);int y_neg=int(p.y<0.);int offset=-(y_neg<<2)+1+((x_neg^y_neg)<<1);float lon=atan(abs(p.y),abs(p.x));float x02=lon*FOUR_OVER_PI;if(x_neg!=y_neg){return vec2(1.-x02,float(offset));}else{return vec2(x02-1.,float(offset));}}vec2 world2clip_healpix(vec3 p){vec2 x_pm1_and_offset=xpm1_and_offset(p.xy);vec2 p_proj=vec2(0.);if(p.z>TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_pos(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,2.-sqrt_3_one_min_z);}else if(p.z<-TRANSITION_Z){float sqrt_3_one_min_z=sqrt(3.*one_minus_z_neg(p));p_proj=vec2((x_pm1_and_offset.x*sqrt_3_one_min_z)+x_pm1_and_offset.y,-2.+sqrt_3_one_min_z);}else{p_proj=vec2(atan(p.y,p.x)*FOUR_OVER_PI,p.z*TRANSITION_Z_INV);}return p_proj*vec2(-0.25,0.5);}void main(){vec2 uv=pos_clip_space*0.5+0.5;vec3 world_pos=texture(position_tex,uv).rgb;frag_pos=vec3(model*vec4(world_pos,1.));gl_Position=vec4(pos_clip_space/(ndc_to_clip*czf),0.,1.);out_clip_pos=pos_clip_space;}";

      /***/
    },

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ id: moduleId,
      /******/ loaded: false,
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ __webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/ module.loaded = true;
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/ __webpack_require__.m = __webpack_modules__;
  /******/
  /************************************************************************/
  /******/ /* webpack/runtime/async module */
  /******/ (() => {
    /******/ var webpackQueues = typeof Symbol === "function" ? Symbol("webpack queues") : "__webpack_queues__";
    /******/ var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
    /******/ var webpackError = typeof Symbol === "function" ? Symbol("webpack error") : "__webpack_error__";
    /******/ var resolveQueue = (queue) => {
      /******/ if (queue && !queue.d) {
        /******/ queue.d = 1;
        /******/ queue.forEach((fn) => fn.r--);
        /******/ queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
        /******/
      }
      /******/
    };
    /******/ var wrapDeps = (deps) =>
      deps.map((dep) => {
        /******/ if (dep !== null && typeof dep === "object") {
          /******/ if (dep[webpackQueues]) return dep;
          /******/ if (dep.then) {
            /******/ var queue = [];
            /******/ queue.d = 0;
            /******/ dep.then(
              (r) => {
                /******/ obj[webpackExports] = r;
                /******/ resolveQueue(queue);
                /******/
              },
              (e) => {
                /******/ obj[webpackError] = e;
                /******/ resolveQueue(queue);
                /******/
              }
            );
            /******/ var obj = {};
            /******/ obj[webpackQueues] = (fn) => fn(queue);
            /******/ return obj;
            /******/
          }
          /******/
        }
        /******/ var ret = {};
        /******/ ret[webpackQueues] = (x) => {};
        /******/ ret[webpackExports] = dep;
        /******/ return ret;
        /******/
      });
    /******/ __webpack_require__.a = (module, body, hasAwait) => {
      /******/ var queue;
      /******/ hasAwait && ((queue = []).d = 1);
      /******/ if (queue) queue.moduleId = module.id;
      /******/ var depQueues = new Set();
      /******/ var exports = module.exports;
      /******/ var currentDeps;
      /******/ var outerResolve;
      /******/ var reject;
      /******/ var promise = new Promise((resolve, rej) => {
        /******/ reject = rej;
        /******/ outerResolve = resolve;
        /******/
      });
      /******/ promise[webpackExports] = exports;
      /******/ promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"]((x) => {}));
      /******/ promise.moduleId = module.id;
      /******/ module.exports = promise;
      /******/ body(
        (deps) => {
          /******/ currentDeps = wrapDeps(deps);
          /******/ var fn;
          /******/ var getResult = () =>
            currentDeps.map((d) => {
              /******/ if (d[webpackError]) throw d[webpackError];
              /******/ return d[webpackExports];
              /******/
            });
          /******/ var promise = new Promise((resolve) => {
            /******/ fn = () => resolve(getResult);
            /******/ fn.r = 0;
            /******/ var fnQueue = (q) => q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn)));
            /******/ currentDeps.map((dep) => dep[webpackQueues](fnQueue));
            /******/
          });
          /******/ return fn.r ? promise : getResult();
          /******/
        },
        (err) => (err ? reject((promise[webpackError] = err)) : outerResolve(exports), resolveQueue(queue))
      );
      /******/ queue && (queue.d = 0);
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/compat get default export */
  /******/ (() => {
    /******/ // getDefaultExport function for compatibility with non-harmony modules
    /******/ __webpack_require__.n = (module) => {
      /******/ var getter = module && module.__esModule ? /******/ () => module["default"] : /******/ () => module;
      /******/ __webpack_require__.d(getter, { a: getter });
      /******/ return getter;
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/define property getters */
  /******/ (() => {
    /******/ // define getter functions for harmony exports
    /******/ __webpack_require__.d = (exports, definition) => {
      /******/ for (var key in definition) {
        /******/ if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          /******/ Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
          /****5*/
        }
        /******/
      }
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/ensure chunk */
  /******/ (() => {
    /******/ __webpack_require__.f = {};
    /******/ // This file contains only the entry chunk.
    /******/ // The chunk loading function for additional chunks
    /******/ __webpack_require__.e = (chunkId) => {
      /******/ return Promise.all(
        Object.keys(__webpack_require__.f).reduce((promises, key) => {
          /******/ __webpack_require__.f[key](chunkId, promises);
          /******/ return promises;
          /******/
        }, [])
      );
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/get javascript chunk filename */
  /******/ (() => {
    /******/ // This function allow to reference async chunks
    /******/ __webpack_require__.u = (chunkId) => {
      /******/ // return url for filenames based on template
      /******/ return "" + chunkId + ".aladin.js";
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/global */
  /******/ (() => {
    /******/ __webpack_require__.g = (function () {
      /******/ if (typeof globalThis === "object") return globalThis;
      /******/ try {
        /******/ return this || new Function("return this")();
        /******/
      } catch (e) {
        /******/ if (typeof window === "object") return window;
        /******/
      }
      /******/
    })();
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/harmony module decorator */
  /******/ (() => {
    /******/ __webpack_require__.hmd = (module) => {
      /******/ module = Object.create(module);
      /******/ if (!module.children) module.children = [];
      /******/ Object.defineProperty(module, "exports", {
        /******/ enumerable: true,
        /******/ set: () => {
          /******/ throw new Error("ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: " + module.id);
          /******/
        },
        /******/
      });
      /******/ return module;
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/hasOwnProperty shorthand */
  /******/ (() => {
    /******/ __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/load script */
  /******/ (() => {
    /******/ var inProgress = {};
    /******/ var dataWebpackPrefix = "hips_webgl_renderer:";
    /******/ // loadScript function to load a script via script tag
    /******/ __webpack_require__.l = (url, done, key, chunkId) => {
      /******/ if (inProgress[url]) {
        inProgress[url].push(done);
        return;
      }
      /******/ var script, needAttach;
      /******/ if (key !== undefined) {
        /******/ var scripts = document.getElementsByTagName("script");
        /******/ for (var i = 0; i < scripts.length; i++) {
          /******/ var s = scripts[i];
          /******/ if (s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) {
            script = s;
            break;
          }
          /******/
        }
        /******/
      }
      /******/ if (!script) {
        /******/ needAttach = true;
        /******/ script = document.createElement("script");
        /******/
        /******/ script.charset = "utf-8";
        /******/ script.timeout = 120;
        /******/ if (__webpack_require__.nc) {
          /******/ script.sevAttribute("nonce", __webpack_require__.nc);
          /******/
        }
        /******/ script.setAttribute("data-webpack", dataWebpackPrefix + key);
        /******/ script.src = url;
        /******/
      }
      /******/ inProgress[url] = [done];
      /******/ var onScriptComplete = (prev, event) => {
        /******/ // avoid mem leaks in IE.
        /******/ script.onerror = script.onload = null;
        /******/ clearTimeout(timeout);
        /******/ var doneFns = inProgress[url];
        /******/ delete inProgress[url];
        /******/ script.parentNode && script.parentNode.removeChild(script);
        /******/ doneFns && doneFns.forEach((fn) => fn(event));
        /******/ if (prev) return prev(event);
        /******/
      };
      /******/ /******/ var timeout = setTimeout(
        onScriptComplete.bind(null, undefined, {
          type: "timeout",
          target: script,
        }),
        120000
      );
      /******/ script.onerror = onScriptComplete.bind(null, script.onerror);
      /******/ script.onload = onScriptComplete.bind(null, script.onload);
      /******/ needAttach && document.head.appendChild(script);
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/make namespace object */
  /******/ (() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = (exports) => {
      /******/ if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, {
          value: "Module",
        });
        /******/
      }
      /******/ Object.defineProperty(exports, "__esModule", { value: true });
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/wasm loading */
  /******/ (() => {
    /******/ __webpack_require__.v = (exports, wasmModuleId, wasmModuleHash, importsObj) => {
      /******/ var req = fetch(__webpack_require__.p + "" + wasmModuleHash + ".module.wasm");
      /******/ if (typeof WebAssembly.instantiateStreaming === "function") {
        /******/ return WebAssembly.instantiateStreaming(req, importsObj)
          /******/ .then((res) => Object.assign(exports, res.instance.exports));
        /******/
      }
      /******/ return req
        /******/ .then((x) => x.arrayBuffer())
        /******/ .then((bytes) => WebAssembly.instantiate(bytes, importsObj))
        /******/ .then((res) => Object.assign(exports, res.instance.exports));
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/publicPath */
  /******/ (() => {
    /******/ var scriptUrl;
    /******/ if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
    /******/ var document = __webpack_require__.g.document;
    /******/ if (!scriptUrl && document) {
      /******/ if (document.currentScript) /******/ scriptUrl = document.currentScript.src;
      /******/ if (!scriptUrl) {
        /******/ var scripts = document.getElementsByTagName("script");
        /******/ if (scripts.length) scriptUrl = scripts[scripts.length - 1].src;
        /******/
      }
      /******/
    }
    /******/ // When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
    /******/ // or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
    /******/ if (!scriptUrl) throw new Error("Automatic publicRath is not supported in this browser");
    /******/ scriptUrl = scriptUrl
      .replace(/#.*$/, "")
      .replace(/\?.*$/, "")
      .replace(/\/[^\/]+$/, "/");
    /******/ __webpack_require__.p = scriptUrl;
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/jsonp chunk loading */
  /******/ (() => {
    /******/ // no baseURI
    /******/
    /******/ // object to store loaded and loading chunks
    /******/ // undefined = chunk not loaded, null = chunk preloaded/prefetched
    /******/ // [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
    /******/ var installedChunks = {
      /******/ 179: 0,
      /******/
    };
    /******/
    /******/ __webpack_require__.f.j = (chunkId, promises) => {
      /******/ // JSONP chunk loading for javascript
      /******/ var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
      /******/ if (installedChunkData !== 0) {
        // 0 means "already installed".
        /******/
        /******/ // a Promise means "currently loading".
        /******/ if (installedChunkData) {
          /******/ promises.push(installedChunkData[2]);
          /******/
        } else {
          /******/ if (true) {
            // all chunks have JS
            /******/ // setup Promise in chunk cache
            /******/ var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
            /******/ promises.push((installedChunkData[2] = promise));
            /******/
            /******/ // start chunk loading
            /******/ var url = __webpack_require__.p + __webpack_require__.u(chunkId);
            /******/ // create error before stack unwound to get useful stacktrace later
            /******/ var error = new Error();
            /******/ var loadingEnded = (event) => {
              /******/ if (__webpack_require__.o(installedChunks, chunkId)) {
                /******/ installedChunkData = installedChunks[chunkId];
                /******/ if (installedChunkData !== 0) installedChunks[chunkId] = undefined;
                /******/ if (installedChunkData) {
                  /******/ var errorType = event && (event.type === "load" ? "missing" : event.type);
                  /******/ var realSrc = event && event.target && event.target.src;
                  /******/ error.message = "Loading chunk " + chunkId + " failed.\n(" + errorType + ": " + realSrc + ")";
                  /******/ error.name = "ChunkLoadError";
                  /******/ error.type = errorType;
                  /******/ error.request = realSrc;
                  /******/ installedChunkData[1](error);
                  /******/
                }
                /******/
              }
              /******/
            };
            /******/ __webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
            /******/
          } else installedChunks[chunkId] = 0;
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
    /******/ // no prefetching
    /******/
    /******/ // no preloaded
    /******/
    /******/ // no HMR
    /******/
    /******/ // no HMR manifest
    /******/
    /******/ // no on chunks loaded
    /******/
    /******/ // install a JSONP callback for chunk loading
    /******/ var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
      /******/ var [chunkIds, moreModules, runtime] = data;
      /******/ // add "moreModules" to the modules object,
      /******/ // then flag all "chunkIds" as loaded and fire callback
      /******/ var moduleId,
        chunkId,
        i = 0;
      /******/ if (chunkIds.some((id) => installedChunks[id] !== 0)) {
        /******/ for (moduleId in moreModules) {
          /******/ if (__webpack_require__.o(moreModules, moduleId)) {
            /******/ __webpack_require__.m[moduleId] = moreModules[moduleId];
            /******/
          }
          /******/
        }
        /******/ if (runtime) var result = runtime(__webpack_require__);
        /******/
      }
      /******/ if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
      /******/ for (; i < chunkIds.length; i++) {
        /******/ chunkId = chunkIds[i];
        /******/ if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
          /******/ installedChunks[chunkId][0]();
          /******/
        }
        /******/ installedChunks[chunkId] = 0;
        /******/
      }
      /******/
      /******/
    };
    /******/
    /******/ var chunkLoadingGlobal = (self["webpackChunkhips_webgl_renderer"] = self["webpackChunkhips_webgl_renderer"] || []);
    /******/ chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
    /******/ chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/nonce */
  /******/ (() => {
    /******/ __webpack_require__.nc = undefined;
    /******/
  })();
  /******/
  /************************************************************************/
  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be in strict mode.
  (() => {
    "use strict";

    // EXPORTS
    __webpack_require__.d(__webpack_exports__, {
      k: () => /* binding */ Aladin,
    }); // CONCATENATED MODULE: ./src/js/Popup.js

    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File Popup.js
     *
     * Author: Thomas Boch [CDS]
     *
     *****************************************************************************/
    var Popup = (function () {
      // constructor
      function Popup(parentDiv, view) {
        this.domEl = $(
          '<div class="aladin-popup-container"><div class="aladin-popup"><a class="aladin-closeBtn">&times;</a><div class="aladin-popupTitle"></div><div class="aladin-popupText"></div></div><div class="aladin-popup-arrow"></div></div>'
        );
        this.domEl.appendTo(parentDiv);
        this.view = view;
        var self = this; // close popup

        this.domEl.find(".aladin-closeBtn").click(function () {
          self.hide();
        });
      }

      Popup.prototype.hide = function () {
        this.domEl.hide();
        this.view.mustClearCatalog = true;
        this.view.catalogForPopup.hide();
      };

      Popup.prototype.show = function () {
        this.domEl.show();
      };

      Popup.prototype.setTitle = function (title) {
        this.domEl.find(".aladin-popupTitle").html(title || "");
      };

      Popup.prototype.setText = function (text) {
        this.domEl.find(".aladin-popupText").html(text || "");
        this.w = this.domEl.outerWidth();
        this.h = this.domEl.outerHeight();
      };

      Popup.prototype.setSource = function (source) {
        // remove reference to popup for previous source
        if (this.source) {
          this.source.popup = null;
        }

        source.popup = this;
        this.source = source;
        this.setPosition(source.x, source.y);
      };

      Popup.prototype.setPosition = function (x, y) {
        var newX = x - this.w / 2;
        var newY = y - this.h;

        if (this.source) {
          newY += this.source.catalog.sourceSize / 2;
        }

        this.domEl[0].style.left = newX + "px";
        this.domEl[0].style.top = newY + "px";
      };

      return Popup;
    })(); // CONCATENATED MODULE: ./src/js/HealpixGrid.js
    // Copyright 2015 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File HealpixGrid
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/
    var HealpixGrid = (function () {
      function HealpixGrid() {}

      HealpixGrid.prototype.redraw = function (ctx, cornersXYViewMap, fov, norder) {
        // on dessine les lignes
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgb(150,150,220)";
        ctx.beginPath();
        var cornersXYView;
        var ipix;

        for (var k = 0, len = cornersXYViewMap.length; k < len; k++) {
          cornersXYView = cornersXYViewMap[k];
          ipix = cornersXYView.ipix; // draw pixel

          ctx.moveTo(cornersXYViee[0].vx, cornersXYView[0].vy);
          ctx.lineTo(cornersXYView[1].vx, cornersXYView[1].vy);
          ctx.lineTo(cornersXYView[2].vx, cornersXYView[2].vy); //ctx.lineTo(cornersXYView[3].vx, cornersXYView[3].vy);
          //ctx.strokeText(ipix, (cornersXYView[0].vx + cornersXYView[2].vx)/2, (cornersXYView[0].vy + cornersXYView[2].vy)/2);
        }

        ctx.stroke(); // on dessine les numéros de pixel HEALpix

        ctx.strokeStyle = "#FFDDDD";
        ctx.beginPath();

        for (var k = 0, len = cornersXYViewMap.length; k < len; k++) {
          cornersXYView = cornersXYViewMap[k];
          ipix = cornersXYView.ipix;
          ctx.strokeText(norder + "/" + ipix, (cornersXYView[0].vx + cornersXYView[2].vx) / 2, (cornersXYView[0].vy + cornersXYView[2].vy) / 2);
        }

        ctx.stroke();
      };

      return HealpixGrid;
    })(); // CONCATENATED MODULE: ./src/js/libs/astro/astroMath.js
    //=================================
    //            AstroMath
    //=================================
    // Class AstroMath having 'static' methods
    var AstroMath = function AstroMath() {}; // Constant for conversion Degrees => Radians (rad = deg*AstroMath.D2R)

    AstroMath.D2R = Math.PI / 180.0; // Constant for conversion Radians => Degrees (deg = rad*AstroMath.R2D)

    AstroMath.R2D = 180.0 / Math.PI;
    /**
     * Function sign
     * @param x value for checking the sign
     * @return -1, 0, +1 respectively if x < 0, = 0, > 0
     */

    AstroMath.sign = function (x) {
      return x > 0 ? 1 : x < 0 ? -1 : 0;
    };
    /**
     * Function cosd(degrees)
     * @param x angle in degrees
     * @returns the cosine of the angle
     */

    AstroMath.cosd = function (x) {
      if (x % 90 == 0) {
        var i = Math.abs(Math.floor(x / 90 + 0.5)) % 4;

        switch (i) {
          case 0:
            return 1;

          case 1:
            return 0;

          case 2:
            return -1;

          case 3:
            return 0;
        }
      }

      return Math.cos(x * AstroMath.D2R);
    };
    /**
     * Function sind(degrees)
     * @param x angle in degrees
     * @returns the sine of the angle
     */

    AstroMath.sind = function (x) {
      if (x % 90 === 0) {
        var i = Math.abs(Math.floor(x / 90 - 0.5)) % 4;

        switch (i) {
          case 0:
            return 1;

          case 1:
            return 0;

          case 2:
            return -1;

          case 3:
            return 0;
        }
      }

      return Math.sin(x * AstroMath.D2R);
    };
    /**
     * Function tand(degrees)
     * @param x angle in degrees
     * @returns the tangent of the angle
     */

    AstroMath.tand = function (x) {
      var resid;
      resid = x % 360;

      if (resid == 0 || Math.abs(resid) == 180) {
        return 0;
      } else if (resid == 45 || resid == 225) {
        return 1;
      } else if (resid == -135 || resid == -315) {
        return -1;
      }

      return Math.tan(x * AstroMath.D2R);
    };
    /**
     * Function asin(degrees)
     * @param sine value [0,1]
     * @return the angle in degrees
     */

    AstroMath.asind = function (x) {
      return Math.asin(x) * AstroMath.R2D;
    };
    /**
     * Function acos(degrees)
     * @param cosine value [0,1]
     * @return the angle in degrees
     */

    AstroMath.acosd = function (x) {
      return Math.acos(x) * AstroMath.R2D;
    };
    /**
     * Function atan(degrees)
     * @param tangent value
     * @return the angle in degrees
     */

    AstroMath.atand = function (x) {
      return Math.atan(x) * AstroMath.R2D;
    };
    /**
     * Function atan2(y,x)
     * @param y y component of the vector
     * @param x x component of the vector
     * @return the angle in radians
     */

    AstroMath.atan2 = function (y, x) {
      if (y != 0.0) {
        var sgny = AstroMath.sign(y);

        if (x != 0.0) {
          var phi = Math.atan(Math.abs(y / x));
          if (x > 0.0) return phi * sgny;
          else if (x < 0) return (Math.PI - phi) * sgny;
        } else return (Math.PI / 2) * sgny;
      } else {
        return x > 0.0 ? 0.0 : x < 0 ? Math.PI : 0.0 / 0.0;
      }
    };
    /**
     * Function atan2d(y,x)
     * @param y y component of the vector
     * @param x x component of the vector
     * @return the angle in degrees
     */

    AstroMath.atan2d = function (y, x) {
      return AstroMath.atan2(y, x) * AstroMath.R2D;
    };
    /*=========================================================================*/

    /**
     * Computation of hyperbolic cosine
     * @param x argument
     */

    AstroMath.cosh = function (x) {
      return (Math.exp(x) + Math.exp(-x)) / 2;
    };
    /**
     * Computation of hyperbolic sine
     * @param x argument
     */

    AstroMath.sinh = function (x) {
      return (Math.exp(x) - Math.exp(-x)) / 2;
    };
    /**
     * Computation of hyperbolic tangent
     * @param x argument
     */

    AstroMath.tanh = function (x) {
      return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
    };
    /**
     * Computation of Arg cosh
     * @param x argument in degrees. Must be in the range [ 1, +infinity ]
     */

    AstroMath.acosh = function (x) {
      return Math.log(x + Math.sqrt(x * x - 1.0));
    };
    /**
     * Computation of Arg sinh
     * @param x argument in degrees
     */

    AstroMath.asinh = function (x) {
      return Math.log(x + Math.sqrt(x * x + 1.0));
    };
    /**
     * Computation of Arg tanh
     * @param x argument in degrees. Must be in the range ] -1, +1 [
     */

    AstroMath.atanh = function (x) {
      return 0.5 * Math.log((1.0 + x) / (1.0 - x));
    }; //=============================================================================
    //      Special Functions using trigonometry
    //=============================================================================

    /**
     * Computation of sin(x)/x
     *	@param x in degrees.
     * For small arguments x <= 0.001, use approximation
     */

    AstroMath.sinc = function (x) {
      var ax = Math.abs(x);
      var y;

      if (ax <= 0.001) {
        ax *= ax;
        y = 1 - (ax * (1.0 - ax / 20.0)) / 6.0;
      } else {
        y = Math.sin(ax) / ax;
      }

      return y;
    };
    /**
     * Computes asin(x)/x
     * @param x in degrees.
     * For small arguments x <= 0.001, use an approximation
     */

    AstroMath.asinc = function (x) {
      var ax = Math.abs(x);
      var y;

      if (ax <= 0.001) {
        ax *= ax;
        y = 1 + (ax * (6.0 + ax * (9.0 / 20.0))) / 6.0;
      } else {
        y = Math.asin(ax) / ax; // ???? radians ???
      }

      return y;
    }; //=============================================================================

    /**
     * Computes the hypotenuse of x and y
     * @param x value
     * @param y value
     * @return sqrt(x*x+y*y)
     */

    AstroMath.hypot = function (x, y) {
      return Math.sqrt(x * x + y * y);
    };
    /** Generate the rotation matrix from the Euler angles
     * @param z	Euler angle
     * @param theta	Euler angle
     * @param zeta	Euler angles
     * @return R [3][3]		the rotation matrix
     * The rotation matrix is defined by:<pre>
     *    R =      R_z(-z)      *        R_y(theta)     *     R_z(-zeta)
     *   |cos.z -sin.z  0|   |cos.the  0 -sin.the|   |cos.zet -sin.zet 0|
     * = |sin.z  cos.z  0| x |   0     1     0   | x |sin.zet  cos.zet 0|
     *   |   0      0   1|   |sin.the  0  cos.the|   |   0        0    1|
     * </pre>
     */

    AstroMath.eulerMatrix = function (z, theta, zeta) {
      var R = new Array(3);
      R[0] = new Array(3);
      R[1] = new Array(3);
      R[2] = new Array(3);
      var cosdZ = AstroMath.cosd(z);
      var sindZ = AstroMath.sind(z);
      var cosdTheta = AstroMath.cosd(theta);
      var w = AstroMath.sind(theta);
      var cosdZeta = AstroMath.cosd(zeta);
      var sindZeta = AstroMath.sind(zeta);
      R[0][0] = cosdZeta * cosdTheta * cosdZ - sindZeta * sindZ;
      R[0][1] = -sindZeta * cosdTheta * cosdZ - cosdZeta * sindZ;
      R[0][2] = -w * cosdZ;
      R[1][0] = cosdZeta * cosdTheta * sindZ + sindZeta * cosdZ;
      R[1][1] = -sindZeta * cosdTheta * sindZ + cosdZeta * cosdZ;
      R[1][2] = -w * sindZ;
      R[2][0] = -w * cosdZeta;
      R[2][1] = -w * cosdZ;
      R[2][2] = cosdTheta;
      return R;
    };

    AstroMath.displayMatrix = function (m) {
      // Number of rows
      var nbrows = m.length; // Max column count

      var nbcols = 0;

      for (var i = 0; i < nbrows; i++) {
        if (m[i].length > nbcols) nbcols = m[i].length;
      }

      var str = "<table>\n";

      for (var i = 0; i < nbrows; i++) {
        str += "<tr>";

        for (var j = 0; j < nbrows; j++) {
          str += "<td>";
          if (i < m[i].length) str += m[i][j].toString();
          str += "</td>";
        }

        str += "</td>\n";
      }

      str += "</table>\n";
      return str;
    }; // CONCATENATED MODULE: ./src/js/libs/astro/projection.js
    var Projection = function Projection(lon0, lat0) {
      this.PROJECTION = Projection.PROJ_TAN;
      this.ROT = this.tr_oR(lon0, lat0);
      this.longitudeIsReversed = false;
    }; //var ROT;
    //var PROJECTION = Projection.PROJ_TAN;	// Default projection

    Projection.PROJ_TAN = 1;
    /* Gnomonic projection*/

    Projection.PROJ_TAN2 = 2;
    /* Stereographic projection*/

    Projection.PROJ_STG = 2;
    Projection.PROJ_SIN = 3;
    /* Orthographic		*/

    Projection.PROJ_SIN2 = 4;
    /* Equal-area 		*/

    Projection.PROJ_ZEA = 4;
    /* Zenithal Equal-area 	*/

    Projection.PROJ_ARC = 5;
    /* For Schmidt plates	*/

    Projection.PROJ_SCHMIDT = 5;
    /* For Schmidt plates	*/

    Projection.PROJ_AITOFF = 6;
    /* Aitoff Projection	*/

    Projection.PROJ_AIT = 6;
    /* Aitoff Projection	*/

    Projection.PROJ_GLS = 7;
    /* Global Sin (Sanson)	*/

    Projection.PROJ_MERCATOR = 8;
    Projection.PROJ_MER = 8;
    Projection.PROJ_LAM = 9;
    /* Lambert Projection	*/

    Projection.PROJ_LAMBERT = 9;
    Projection.PROJ_TSC = 10;
    /* Tangent Sph. Cube	*/

    Projection.PROJ_QSC = 11;
    /* QuadCube Sph. Cube	*/

    Projection.PROJ_MOLLWEIDE = 12;
    Projection.PROJ_HEALPIX = 13;
    /* HEALPix, not implemented */

    Projection.PROJ_LIST = [
      "Mercator",
      Projection.PROJ_MERCATOR,
      "Gnomonic",
      Projection.PROJ_TAN,
      "Stereographic",
      Projection.PROJ_TAN2,
      "Orthographic",
      Projection.PROJ_SIN,
      "Zenithal",
      Projection.PROJ_ZEA,
      "Schmidt",
      Projection.PROJ_SCHMIDT,
      "Aitoff",
      Projection.PROJ_AITOFF,
      "Lambert",
      Projection.PROJ_LAMBERT, //	"Tangential",Projection.PROJ_TSC,
      //	"Quadrilaterized",Projection.PROJ_QSC,
    ];
    Projection.PROJ_NAME = [
      "-",
      "Gnomonic",
      "Stereographic",
      "Orthographic",
      "Equal-area",
      "Schmidt plates",
      "Aitoff",
      "Global sin",
      "Mercator",
      "Lambert",
    ];
    Projection.prototype = {
      /** Set the center of the projection
       *
       * (ajout T. Boch, 19/02/2013)
       *
       * */
      setCenter: function setCenter(lon0, lat0) {
        this.ROT = this.tr_oR(lon0, lat0);
      },

      /** Reverse the longitude
       * If set to true, longitudes will increase from left to right
       *
       * */
      reverseLongitude: function reverseLongitude(b) {
        this.longitudeIsReversed = b;
      },

      /**
       * Set the projection to use
       * p = projection code
       */
      setProjection: function setProjection(p) {
        this.PROJECTION = p;
      },

      /**
       * Computes the projection of 1 point : ra,dec => X,Y
       * alpha, delta = longitude, lattitude
       */
      project: function project(alpha, delta) {
        var u1 = this.tr_ou(alpha, delta); // u1[3]

        var u2 = this.tr_uu(u1, this.ROT); // u2[3]

        var P = this.tr_up(this.PROJECTION, u2); // P[2] = [X,Y]

        if (P == null) {
          return null;
        }

        if (this.longitudeIsReversed) {
          return {
            X: P[0],
            Y: -P[1],
          };
        } else {
          return {
            X: -P[0],
            Y: -P[1],
          };
        } //return { X: -P[0], Y: -P[1] };
      },

      /**
       * Computes the coordinates from a projection point : X,Y => ra,dec
       * return o = [ ra, dec ]
       */
      unproject: function unproject(X, Y) {
        if (!this.longitudeIsReversed) {
          X = -X;
        }

        Y = -Y;
        var u1 = this.tr_pu(this.PROJECTION, X, Y); // u1[3]

        var u2 = this.tr_uu1(u1, this.ROT); // u2[3]

        var o = this.tr_uo(u2); // o[2]

        /*
    		if (this.longitudeIsReversed) {
                return { ra: 360-o[0], dec: o[1] };
            }
            else {
    		    return { ra: o[0], dec: o[1] };
            }
    */

        return {
          ra: o[0],
          dec: o[1],
        };
      },

      /**
       * Compute projections from unit vector
       * The center of the projection correspond to u = [1, 0, 0)
       * proj = projection system (integer code like _PROJ_MERCATOR_
       * u[3] = unit vector
       * return: an array [x,y] or null
       */
      tr_up: function tr_up(proj, u) {
        var x = u[0];
        var y = u[1];
        var z = u[2];
        var r, den;
        var pp;
        var X, Y;
        r = AstroMath.hypot(x, y); // r = cos b

        if (r == 0.0 && z == 0.0) return null;

        switch (proj) {
          default:
            pp = null;
            break;

          case Projection.PROJ_AITOFF:
            den = Math.sqrt((r * (r + x)) / 2.0); // cos b . cos l/2

            X = Math.sqrt(2.0 * r * (r - x));
            den = Math.sqrt((1.0 + den) / 2.0);
            X = X / den;
            Y = z / den;
            if (y < 0.0) X = -X;
            pp = [X, Y];
            break;

          case Projection.PROJ_GLS:
            Y = Math.asin(z); // sin b

            X = r != 0 ? Math.atan2(y, x) * r : 0.0;
            pp = [X, Y];
            break;

          case Projection.PROJ_MERCATOR:
            if (r != 0) {
              X = Math.atan2(y, x);
              Y = AstroMath.atanh(z);
              pp = [X, Y];
            } else {
              pp = null;
            }

            break;

          case Projection.PROJ_TAN:
            if (x > 0.0) {
              X = y / x;
              Y = z / x;
              pp = [X, Y];
            } else {
              pp = null;
            }

            break;

          case Projection.PROJ_TAN2:
            den = (1.0 + x) / 2.0;

            if (den > 0.0) {
              X = y / den;
              Y = z / den;
              pp = [X, Y];
            } else {
              pp = null;
            }

            break;

          case Projection.PROJ_ARC:
            if (x <= -1.0) {
              // Distance of 180 degrees
              X = Math.PI;
              Y = 0.0;
            } else {
              // Arccos(x) = Arcsin(r)
              r = AstroMath.hypot(y, z);
              if (x > 0.0) den = AstroMath.asinc(r);
              else den = Math.acos(x) / r;
              X = y * den;
              Y = z * den;
            }

            pp = [X, Y];
            break;

          case Projection.PROJ_SIN:
            if (x >= 0.0) {
              X = y;
              Y = z;
              pp = [X, Y];
            } else {
              pp = null;
            }

            break;

          case Projection.PROJ_SIN2:
            // Always possible
            den = Math.sqrt((1.0 + x) / 2.0);

            if (den != 0) {
              X = y / den;
              Y = z / den;
            } else {
    1         // For x = -1
              X = 2.0;
              Y = 0.0;
            }

            pp = [X, Y];
            break;

          case Projection.PROJ_LAMBERT:
            // Always possible
            Y = z;
            X = 0;
            if (r != 0) X = Math.atan2(y, x);
            pp = [X, Y];
            break;
        }

        return pp;
      },

      /**
       * Computes Unit vector from a position in projection centered at position (0,0).
       * proj = projection code
       * X,Y : coordinates of the point in the projection
       * returns : the unit vector u[3] or a face number for cube projection.
       *           null if the point is outside the limits, or if the projection is unknown.
       */
      tr_pu: function tr_pu(proj, X, Y) {
        var r, s, x, y, z;

        switch (proj) {
          default:
            return null;

          case Projection.PROJ_AITOFF:
            // Limit is ellipse with axises
            // a = 2 * sqrt(2) ,  b = sqrt(2)
            // Compute dir l/2, b
            r = (X * X) / 8 + (Y * Y) / 2; // 1 - cos b . cos l/2

            if (r > 1.0) {
              // Test outside domain */
              return null;
            }

            x = 1.0 - r; // cos b . cos l/2

            s = Math.sqrt(1.0 - r / 2.0); // sqrt(( 1 + cos b . cos l/2)/2)

            y = (X * s) / 2.0;
            z = Y * s; // From (l/2,b) to (l,b)

            r = AstroMath.hypot(x, y); // cos b

            if (r != 0.0) {
              s = x;
              x = (s * s - y * y) / r;
              y = (2.0 * s * y) / r;
            }

            break;

          case Projection.PROJ_GLS:
            // Limit is |Y| <= pi/2
            z = Math.sin(Y);
            r = 1 - z * z; // cos(b) ** 2

            if (r < 0.0) {
              return null;
            }

            r = Math.sqrt(r); // cos b

            if (r != 0.0) {
              s = X / r; // Longitude
            } else {
              s = 0.0; // For poles
            }

            x = r * Math.cos(s);
            y = r * Math.sin(s);
            break;

          case Projection.PROJ_MERCATOR:
            z = AstroMath.tanh(Y);
            r = 1.0 / AstroMath.cosh(Y);
            x = r * Math.cos(X);
            y = r * Math.sin(X);
            break;

          case Projection.PROJ_LAMBERT:
            // Always possible
            z = Y;
            r = 1 - z * z; // cos(b) ** 2

            if (r < 0.0) {
              return null;
            }

            r = Math.sqrt(r); // cos b

            x = r * Math.cos(X);
            y = r * Math.sin(X);
            break;

          case Projection.PROJ_TAN:
            // No limit
            x = 1.0 / Math.sqrt(1.0 + X * X + Y * Y);
            y = X * x;
            z = Y * x;
            break;

          case Projection.PROJ_TAN2:
            // No limit
            r = (X * X + Y * Y) / 4.0;
            s = 1.0 + r;
            x = (1.0 - r) / s;
            y = X / s;
            z = Y / s;
            break;

          case Projection.PROJ_ARC:
            // Limit is circle, radius PI
            r = AstroMath.hypot(X, Y);

            if (r > Math.PI) {
              return null;
            }

            s = AstroMath.sinc(r);
            x = Math.cos(r);
            y = s * X;
            z = s * Y;
            break;

          case Projection.PROJ_SIN:
            // Limit is circle, radius 1
            s = 1.0 - X * X - Y * Y;

            if (s < 0.0) {
              return null;
            }

            x = Math.sqrt(s);
            y = X;
            z = Y;
            break;

          case Projection.PROJ_SIN2:
            // Limit is circle, radius 2	*/
            r = (X * X + Y * Y) / 4;

            if (r > 1.0) {
              return null;
            }

            s = Math.sqrt(1.0 - r);
            x = 1.0 - 2.0 * r;
            y = s * X;
            z = s * Y;
            break;
        }

        return [x, y, z];
      },

      /**
       * Creates the rotation matrix R[3][3] defined as
       * R[0] (first row) = unit vector towards Zenith
       * R[1] (second row) = unit vector towards East
       * R[2] (third row) = unit vector towards North
       * o[2] original angles
       * @return rotation matrix
       */
      tr_oR: function tr_oR(lon, lat) {
        var R = new Array(3);
        R[0] = new Array(3);
        R[1] = new Array(3);
        R[2] = new Array(3);
        R[2][2] = AstroMath.cosd(lat);
        R[0][2] = AstroMath.sind(lat);
        R[1][1] = AstroMath.cosd(lon);
        R[1][0] = -AstroMath.sind(lon);
        R[1][2] = 0.0;
        R[0][0] = R[2][2] * R[1][1];
        R[0][1] = -R[2][2] * R[1][0];
        R[2][0] = -R[0][2] * R[1][1];
        R[2][1] = R[0][2] * R[1][0];
        return R;
      },

      /**
       * Transformation from polar coordinates to Unit vector
       * @return U[3]
       */
      tr_ou: function tr_ou(ra, dec) {
        var u = new Array(3);
        var cosdec = AstroMath.cosd(dec);
        u[0] = cosdec * AstroMath.cosd(ra);
        u[1] = cosdec * AstroMath.sind(ra);
        u[2] = AstroMath.sind(dec);
        return u;
      },

      /**
       * Rotates the unit vector u1 using the rotation matrix
       * u1[3] unit vector
       * R[3][3] rotation matrix
       * return resulting unit vector u2[3]
       */
      tr_uu: function tr_uu(u1, R) {
        var u2 = new Array(3);
        var x = u1[0];
        var y = u1[1];
        var z = u1[2];
        u2[0] = R[0][0] * x + R[0][1] * y + R[0][2] * z;
        u2[1] = R[1][0] * x + R[1][1] * y + R[1][2] * z;
        u2[2] = R[2][0] * x + R[2][1] * y + R[2][2] * z;
        return u2;
      },

      /**
       * reverse rotation the unit vector u1 using the rotation matrix
       * u1[3] unit vector
       * R[3][3] rotation matrix
       * return resulting unit vector u2[3]
       */
      tr_uu1: function tr_uu1(u1, R) {
        var u2 = new Array(3);
        var x = u1[0];
        var y = u1[1];
        var z = u1[2];
        u2[0] = R[0][0] * x + R[1][0] * y + R[2][0] * z;
        u2[1] = R[0][1] * x + R[1][1] * y + R[2][1] * z;
        u2[2] = R[0][2] * x + R[1][2] * y + R[2][2] * z;
        return u2;
      },

      /**
       * Computes angles from direction cosines
       * u[3] = direction cosines vector
       * return o = [ ra, dec ]
       */
      tr_uo: function tr_uo(u) {
        var x = u[0];
        var y = u[1];
        var z = u[2];
        var r2 = x * x + y * y;
        var ra, dec;

        if (r2 == 0.0) {
          // in case of poles
          if (z == 0.0) {
            return null;
          }

          ra = 0.0;
          dec = z > 0.0 ? 90.0 : -90.0;
        } else {
          dec = AstroMath.atand(z / Math.sqrt(r2));
          ra = AstroMath.atan2d1y, x);
          if (ra < 0.0) ra += 360.0;
        }

        return [ra, dec];
      },
    }; // CONCATENATED MODULE: ./src/js/ProjectionEnum.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File CooFrameEnum
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var ProjectionEnum = {
      SIN: Projection.PROJ_SIN,
      AITOFF: Projection.PROJ_AITOFF,
      MERCATOR: Projection.PROJ_MERCATOR,
      ARC: Projection.PROJ_ARC,
      TAN: Projection.PROJ_TAN,
      MOL: Projection.PROJ_MOLLWEIDE,
      HPX: Projection.PROJ_HEALPIX,
    }; // CONCATENATED MODULE: ./src/js/CooFrameEnum.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File CooFrameEnum
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/
    var CooFrameEnum = (function () {
      var systems = {
        J2000: "J2000",
        GAL: "Galactic",
      };
      return {
        SYSTEMS: systems,
        J2000: {
          label: "J2000",
          system: systems.J2000,
        },
        J2000d: {
          label: "J2000d",
          system: systems.J2000,
        },
        GAL: {
          label: "Galactic",
          system: systems.GAL,
        },
        fromString: function fromString(str, defaultValue) {
          if (!str) {
            return defaultValue ? defaultValue : null;
          }

          str = str.toLowerCase().replace(/^\s+|\s+$/g, ""); // convert to lowercase and trim

          if (str.indexOf("j2000d") == 0 || str.indexOf("icrsd") == 0) {
            return CooFrameEnum.J2000d;
          } else if (str.indexOf("j2000") == 0 || str.indexOf("icrs") == 0) {
            return CooFrameEnum.J2000;
          } else if (str.indexOf("gal") == 0) {
            return CooFrameEnum.GAL;
          } else {
            return defaultValue ? defaultValue : null;
          }
        },
      };
    })(); // CONCATENATED MODULE: ./src/js/AladinUtils.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File AladinUtils
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var AladinUtils = (function () {
      return {
        /**
         * passage de xy projection à xy dans la vue écran
         * @param x
         * @param y
         * @param width
         * @param height
         * @param largestDim largest dimension of the view
         * @returns position in the view
         */
        xyToView: function xyToView(x, y, width, height, largestDim, zoomFactor, round) {
          if (round == undefined) {
            // we round by default
            round = true;
          }

          if (round) {
            // we round the result for potential performance gains
            return {
              vx: AladinUtils.myRound((largestDim / 2) * (1 + zoomFactor * x) - (largestDim - width) / 2),
              vy: AladinUtils.myRound((largestDim / 2) * (1 + zoomFactor * y) - (largestDim - height) / 2),
            };
          } else {
            return {
              vx: (largestDim / 2) * (1 + zoomFactor * x) - (largestDim - width) / 2,
              vy: (largestDim / 2) * (1 + zoomFactor * y) - (largestDim - height) / 2,
            };
          }
        },

        /**
         * passage de xy dans la vue écran à xy projection
         * @param vx
         * @param vy
         * @param width
         * @param height
         * @param largestDim
         * @param zoomFactor
         * @returns position in xy projection
         */
        viewToXy: function viewToXy(vx, vy, width, height, largestDim, zoomFactor) {
          return {
            x: ((2 * vx + (largestDim - width)) / largestDim - 1) / zoomFactor,
            y: ((2 * vy + (largestDim - height)) / largestDim - 1) / zoomFactor,
          };
        },

        /**
         * convert a
         * @returns position x,y in the view. Null if projection is impossible
         */

        /*radecToViewXy: function(ra, dec, currentProjection, currentFrame, width, height, largestDim, zoomFactor) {
        var xy;
        if (currentFrame.system != CooFrameEnum.SYSTEMS.J2000) {
            var lonlat = CooConversion.J2000ToGalactic([ra, dec]);
            xy = currentProjection.project(lonlat[0], lonlat[1]);
        }
        else {
            xy = currentProjection.project(ra, dec);
        }
        if (!xy) {
            return null;
        }
         return AladinUtils.xyToView(xy.X, xy.Y, width, height, largestDim, zoomFactor, false);
    },*/
        radecToViewXy: function radecToViewXy(ra, dec, view) {
          //var xy;
          //if (currentFrame.system != CooFrameEnum.SYSTEMS.J2000) {
          //    var lonlat = CooConversion.J2000ToGalactic([ra, dec]);
          //    xy = view.aladin.webglAPI.worldToScreen(lonlat[0], lonlat[1]);
          //}
          //else {
          //var lonlat = CooConversion.J2000ToGalactic([ra, dec]);
          var xy = view.aladin.webglAPI.worldToScreen(ra, dec); //}
          //if (!xy) {
          //    return null;
          //}

          return xy;
        },
        // radecToViewXy: function radecToViewXy(ra, dec, view, frame) {
        //   var xy;
        //   // console.log("frame", frame);
        //   if (frame != undefined && frame.system != CooFrameEnum.SYSTEMS.J2000) {
        //     var lonlat = CooConversion.J2000ToGalactic([ra, dec]);
        //     xy = view.aladin.webglAPI.worldToScreen(lonlat[0], lonlat[1]);
        //   } else {
        //     var lonlat = CooConversion.J2000ToGalactic([ra, dec]);
        //     // var xy = view.aladin.webglAPI.worldToScreen(ra, dec);
        //     xy = view.aladin.webglAPI.worldToScreen(lonlat[0], lonlat[1]);
        //   }
        //   if (!xy) {
        //     return null;
        //   }

        //   return xy;
        // },

        // radecToViewXy: function radecToViewXy(ra, dec, view) {
        //   var xy;
        //   if (currentFrame.system != CooFrameEnum.SYSTEMS.J2000) {
        //     var lonlat = CooConversion.J2000ToGalactic([ra, dec]);
        //     xy = view.aladin.webglAPI.worldToScreen(lonlat[0], lonlat[1]);
        //   } else {
        //     var lonlat = CooConversion.J2000ToGalactic([ra, dec]);
        //     var xy = view.aladin.webglAPI.worldToScreen(ra, dec);
        //   }
        //   if (!xy) {
        //     return null;
        //   }

        //   return xy;
        // },
        myRound: function myRound(a) {
          if (a < 0) {
            return -1 * (-a | 0);
          } else {
            return a | 0;
          }
        },

        /**
         * Test whether a xy position is the view
         * @param vx
         * @param vy
         * @param width
         * @param height
         * @returns a boolean whether (vx, vy) is in the screen
         */
        isInsideViewXy: function isInsideViewXy(vx, vy, width, height) {
          return vx >= 0 && vx < width && vy >= 0 && vy < height;
        },

        /**
         * tests whether a healpix pixel is visible or not
         * @param pixCorners array of position (xy view) of the corners of the pixel
         * @param viewW
         */
        isHpxPixVisible: function isHpxPixVisible(pixCorners, viewWidth, viewHeight) {
          for (var i = 0; i < pixCorners.length; i++) {
            if (pixCorners[i].vx >= -20 && pixCorners[i].vx < viewWidth + 20 && pixCorners[i].vy >= -20 && pixCorners[i].vy < viewHeight + 20) {
              return true;
            }
          }

          return false;
        },
        ipixToIpix: function ipixToIpix(npixIn, norderIn, norderOut) {
          var npixOut = [];

          if (norderIn >= norderOut) {
          }
        },
        // Zoom is handled in the backend

        /*getZoomFactorForAngle: function(angleInDegrees, projectionMethod) {
        var p1 = {ra: 0, dec: 0};
        var p2 = {ra: angleInDegrees, dec: 0};
        var projection = new Projection(angleInDegrees/2, 0);
        projection.setProjection(projectionMethod);
        var p1Projected = projection.project(p1.ra, p1.dec);
        var p2Projected = projection.project(p2.ra, p2.dec);
       
        var zoomFactor = 1/Math.abs(p1Projected.X - p2Projected.Y);
         return zoomFactor;
    },*/
        counterClockwiseTriangle: function counterClockwiseTriangle(x1, y1, x2, y2, x3, y3) {
          // From: https://math.stackexchange.com/questions/1324179/how-to-tell-if-3-connected-points-are-connected-clockwise-or-counter-clockwise
          // | x1, y1, 1 |
          // | x2, y2, 1 | > 0 => the triangle is given in anticlockwise order
          // | x3, y3, 1 |
          return x1 * y2 + y1 * x3 + x2 * y3 - x3 * y2 - y3 * x1 - x2 * y1 >= 0;
        },
        // grow array b of vx,vy view positions by *val* pixels
        grow2: function grow2(b, val) {
          var j = 0;

          for (var i = 0; i < 4; i++) {
            if (b[i] == null) {
              j++;
            }
          }

          if (j > 1) {
            return b;
          }

          var b1 = [];

          for (var i = 0; i < 4; i++) {
            b1.push({
              vx: b[i].vx,
              vy: b[i].vy,
            });
          }

          for (var i = 0; i < 2; i++) {
            var a = i == 1 ? 1 : 0;
            var c = i == 1 ? 3 : 2;

            if (b1[a] == null) {
              var d, g;

              if (a == 0 || a == 3) {
                d = 1;
                g = 2;
              } else {
                d = 0;
                g = 3;
              }

              b1[a] = {
                vx: (b1[d].vx + b1[g].vx) / 2,
                vy: (b1[d].vy + b1[g].vy) / 2,
              };
            }

            if (b1[c] == null) {
              var d, g;

              if (c == 0 || c == 3) {
                d = 1;
                g = 2;
              } else {
                d = 0;
                g = 3;
              }

              b1[c] = {
                vx: (b1[d].vx + b1[g].vx) / 2,
                vy: (b1[d].vy + b1[g].vy) / 2,
              };
            }

            if (b1[a] == null || b1[c] == null) {
              continue;
            }

            var angle = Math.atan2(b1[c].vy - b1[a].vy, b1[c].vx - b1[a].vx);
            var chouilla = val * Math.cos(angle);
            b1[a].vx -= chouilla;
            b1[c].vx += chouilla;
            chouilla = val * Math.sin(angle);
            b1[a].vy -= chouilla;
            b1[c].vy += chouilla;
          }

          return b1;
        },
        // SVG icons templates are stored here rather than in a CSS, as to allow
        // to dynamically change the fill color
        // Pretty ugly, haven't found a prettier solution yet
        //
        // TODO: store this in the Stack class once it will exist
        //
        SVG_ICONS: {
          CATALOG:
            '<svg xmlns="http://www.w3.org/2000/svg"><polygon points="1,0,5,0,5,3,1,3"  fill="FILLCOLOR" /><polygon points="7,0,9,0,9,3,7,3"  fill="FILLCOLOR" /><polygon points="10,0,12,0,12,3,10,3"  fill="FILLCOLOR" /><polygon points="13,0,15,0,15,3,13,3"  fill="FILLCOLOR" /><polyline points="1,5,5,9"  stroke="FILLCOLOR" /><polyline points="1,9,5,5" stroke="FILLCOLOR" /><line x1="7" y1="7" x2="15" y2="7" stroke="FILLCOLOR" stroke-width="2" /><polyline points="1,11,5,15"  stroke="FILLCOLOR" /><polyline points="1,15,5,11"  stroke="FILLCOLOR" /><line x1="7" y1="13" x2="15" y2="13" stroke="FILLCOLOR" stroke-width="2" /></svg>',
          MOC: '<svg xmlns="http://www.w3.org/2000/svg"><polyline points="0.5,7,2.5,7,2.5,5,7,5,7,3,10,3,10,5,13,5,13,7,15,7,15,9,13,9,13,12,10,12,10,14,7,14,7,12,2.5,12,2.5,10,0.5,10,0.5,7" stroke-width="1" stroke="FILLCOLOR" fill="transparent" /><line x1="1" y1="10" x2="6" y2="5" stroke="FILLCOLOR" stroke-width="0.5" /><line x1="2" y1="12" x2="10" y2="4" stroke="FILLCOLOR" stroke-width="0.5" /><line x1="5" y1="12" x2="12" y2="5" stroke="FILLCOLOR" stroke-width="0.5" /><line x1="7" y1="13" x2="13" y2="7" stroke="FILLCOLOR" stroke-width="0.5" /><line x1="10" y1="13" x2="13" y2="10" stroke="FILLCOLOR" stroke-width="0.5" /></svg>',
          OVERLAY:
            '<svg xmlns="http://www.w3.org/2000/svg"><polygon points="10,5,10,1,14,1,14,14,2,14,2,9,6,9,6,5" fill="transparent" stroke="FILLCOLOR" stroke-width="2"/></svg>',
        },
      };
    })(); // CONCATENATED MODULE: ./src/js/Utils.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File Utils
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var Utils = {}; // list of URL domains that can be safely switched from HTTP to HTTPS

    Utils.HTTPS_WHITELIIST = [
      "alasky.u-strasbg.fr",
      "alaskybis.u-strasbg.fr",
      "alasky.unistra.fr",
      "alaskybis.unistra.fr",
      "alasky.cds.unistra.fr",
      "alaskybis.cds.unistra.fr",
      "hips.astron.nl",
      "jvo.nao.ac.jp",
      "archive.cefca.es",
      "cade.irap.omp.eu",
      "skies.esac.esa.int",
    ];
    Utils.cssScale = undefined; // adding relMouseCoords to HTMLCanvasElement prototype (see http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element )

    function relMouseCoords(event) {
      var totalOffsetX = 0;
      var totalOffsetY = 0;
      var canvasX = 0;
      var canvasY = 0;
      var currentElement = this;

      if (event.offsetX) {
        return {
          x: event.offsetX,
          y: event.offsetY,
        };
      } else {
        if (!Utils.cssScale) {
          var st = window.getComputedStyle(document.body, null);
          var tr =
            st.getPropertyValue("-webkit-transform") ||
            st.getPropertyValue("-moz-transform") ||
            st.getPropertyValue("-ms-transform") ||
            st.getPropertyValue("-o-transform") ||
            st.getPropertyValue("transform");
          var matrixRegex = /matrix\((-?\d*\.?\d+),\s*0,\s*0,\s*(-?\d*\.?\d+),\s*0,\s*0\)/;
          var matches = tr.match(matrixRegex);

          if (matches) {
            Utils.cssScale = parseFloat(matches[1]);
          } else {
            Utils.cssScale = 1;
          }
        }

        var e = event;
        var canvas = e.target; // http://www.jacklmoore.com/notes/mouse-position/

        var target = e.target || e.srcElement;
        var style = target.currentStyle || window.getComputedStyle(target, null);
        var borderLeftWidth = parseInt(style["borderLeftWidth"], 10);
        var borderTopWidth = parseInt(style["borderTopWidth"], 10);
        var rect = target.getBoundingClientRect();
        var clientX = e.clientX;
        var clientY = e.clientY;

        if (e.originalEvent.changedTouches) {
          clientX = e.originalEvent.changedTouches[0].clientX;
          clientY = e.originalEvent.changedTouches[0].clientY;
        }

        var offsetX = clientX - borderLeftWidth - rect.left;
        var offsetY = clientY - borderTopWidth - rect.top;
        return {
          x: parseInt(offsetX / Utils.cssScale),
          y: parseInt(offsetY / Utils.cssScale),
        };
      }
    }

    HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords; //Function.prototype.bind polyfill from
    //https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind

    if (!Function.prototype.bind) {
      Function.prototype.bind = function (obj) {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        if (typeof this !== "function") {
          throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var slice = [].slice,
          args = slice.call(arguments, 1),
          self = this,
          nop = function nop() {},
          bound = function bound() {
            return self.apply(this instanceof nop ? this : obj || {}, args.concat(slice.call(arguments)));
          };

        bound.prototype = this.prototype;
        return bound;
      };
    } //$ = $ || jQuery;

    /* source : http://stackoverflow.com/a/8764051 */

    $.urlParam = function (name, queryString) {
      if (queryString === undefined) {
        queryString = location.search;
      }

      return (
        decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(queryString) || [, ""])[1].replace(/\+/g, "%20")) || null
      );
    };
    /* source: http://stackoverflow.com/a/1830844 */

    Utils.isNumber = function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    };

    Utils.isInt = function (n) {
      return Utils.isNumber(n) && Math.floor(n) == n;
    };
    /* a debounce function, used to prevent multiple calls to the same function if less than delay milliseconds have passed */

    Utils.debounce = function (fn, delay) {
      var timer = null;
      return function () {
        var context = this,
          args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    };
    /* return a throttled function, to rate limit the number of calls (by default, one call every 250 milliseconds) */

    Utils.throttle = function (fn, threshhold, scope) {
      threshhold || (threshhold = 250);
      var last, deferTimer;
      return function () {
        var context = scope || this;
        var now = +new Date(),
          args = arguments;

        if (last && now < last + threshhold) {
          // hold on to it
          clearTimeout(deferTimer);
          deferTimer = setTimeout(function () {
            last = now;
            fn.apply(context, args);
          }, threshhold);
        } else {
          last = now;
          fn.apply(context, args);
        }
      };
    };
    /* A LRU cache, inspired by https://gist.github.com/devinus/409353#file-gistfile1-js */
    // TODO : utiliser le LRU cache pour les tuiles images

    Utils.LRUCache = function (maxsize) {
      this._keys = [];
      this._items = {};
      this._expires = {};
      this._size = 0;
      this._maxsize = maxsize || 1024;
    };

    Utils.LRUCache.prototype = {
      set: function set(key, value) {
        var keys = this._keys,
          items = this._items,
          expires = this._expires,
          size = this._size,
          maxsize = this._maxsize;

        if (size >= maxsize) {
          // remove oldest element when no more room
          keys.sort(function (a, b) {
            if (expires[a] > expires[b]) return -1;
            if (expires[a] < expires[b]) return 1;
            return 0;
          });
          size--;
        }

        keys[size] = key;
        items[key] = value;
        expires[key] = Date.now();
        size++;
        this._keys = keys;
        this._items = items;
        this._expires = expires;
        this._size = size;
      },
      get: function get(key) {
        var item = this._items[key];

        if (item) {
          this._expires[key] = Date.now();
        }

        return item;
      },
      keys: function keys() {
        return this._keys;
      },
    }; ////////////////////////////////////////////////////////////////////////////:

    /**
  Make an AJAX call, given a list of potential mirrors
  First successful call will result in options.onSuccess being called back
  If all calls fail, onFailure is called back at the end

  This method assumes the URL are CORS-compatible, no proxy will be used
 */

    Utils.loadFromMirrors = function (urls, options) {
      var data = (options && options.data) || null;
   7  var method = (options && options.method) || "GET";
      var dataType = (options && options.dataType) || null;
      var timeout = (options && options.timeout) || 20;
      var onSuccess = (options && options.onSuccess) || null;
      var onFailure = (options && options.onFailure) || null;

      if (urls.length === 0) {
        typeof onFailure === "function" && onFailure();
      } else {
        var ajaxOptions = {
          url: urls[0],
          data: data,
        };

        if (dataType) {
          ajaxOptions.dataType = dataType;
        }

        $.ajax(ajaxOptions)
          .done(function (data) {
            typeof onSuccess === "function" && onSuccess(data);
          })
          .fail(function () {
            Utils.loadFromMirrors(urls.slice(1), options);
          });
      }
    }; // return the jquery ajax object configured with the requested parameters
    // by default, we use the proxy (safer, as we don't know if the remote server supports CORS)

    Utils.getAjaxObject = function (url, method, dataType, useProxy) {
      if (useProxy !== false) {
        useProxy = true;
      }

      if (useProxy === true) {
        var urlToRequest = Aladin.JSONP_PROXY + "?url=" + encodeURIComponent(url);
      } else {
        urlToRequest = url;
      }

      method = method || "GET";
      dataType = dataType || null;
      return $.ajax({
        url: urlToRequest,
        method: method,
        dataType: dataType,
      });
    }; // return true if script is executed in a HTTPS context
    // return false otherwise

    Utils.isHttpsContext = function () {
      return window.location.protocol === "https:";
    }; // generate an absolute URL from a relative URL
    // example: getAbsoluteURL('foo/bar/toto') return http://cds.unistra.fr/AL/foo/bar/toto if executed from page http://cds.unistra.fr/AL/

    Utils.getAbsoluteURL = function (url) {
      var a = document.createElement("a");
      a.href = url;
      return a.href;
    }; // generate a valid v4 UUID

    Utils.uuidv4 = function () {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
    /**
     * @function
     * @description Deep clone a class instance.
     * @param {object} instance The class instance you want to clone.
     * @returns {object} A new cloned instance.
     */

    Utils.clone = function (instance) {
      return Object.assign(
        Object.create(
          // Set the prototype of the new object to the prototype of the instance.
          // Used to allow new object behave like class instance.
          Object.getPrototypeOf(instance)
        ), // Prevent shallow copies of nested structures like arrays, etc
        JSON.parse(JSON.stringify(instance))
      );
    }; // CONCATENATED MODULE: ./src/js/libs/astro/coo.js
    //=================================
    // Class Coo
    //=================================

    /**
     * Constructor
     * @param longitude longitude (decimal degrees)
     * @param latitude latitude (decimal degrees)
     * @param prec precision
     * (8: 1/1000th sec, 7: 1/100th sec, 6: 1/10th sec, 5: sec, 4: 1/10th min, 3: min, 2: 1/10th deg, 1: deg
     */

    var coo_Coo = function Coo(longitude, latitude, prec) {
      this.lon = longitude;
      this.lat = latitude;
      this.prec = prec;
      this.frame = null;
      this.computeDirCos();
    };
    coo_Coo.factor = [3600.0, 60.0, 1.0];
    coo_Coo.prototype = {
      setFrame: function setFrame(astroframe) {
        this.frame = astroframe;
      },
      computeDirCos: function computeDirCos() {
        var coslat = AstroMath.cosd(this.lat);
        this.x = coslat * AstroMath.cosd(this.lon);
        this.y = coslat * AstroMath.sind(this.lon);
        this.z = AstroMath.sind(this.lat);
      },
      computeLonLat: function computeLonLat() {
        var r2 = this.x * this.x + this.y * this.y;
        this.lon = 0.0;

        if (r2 == 0.0) {
          // In case of poles
          if (this.z == 0.0) {
            this.lon = 0.0 / 0.0;
            this.lat = 0.0 / 0.0;
          } else {
            this.lat = this.z > 0.0 ? 90.0 : -90.0;
          }
        } else {
          this.lon = AstroMath.atan2d(this.y, this.x);
          this.lat = AstroMath.atan2d(this.z, Math.sqrt(r2));
          if (this.lon < 0) this.lon += 360.0;
        }
      },

      /**
       * Squared distance between 2 points (= 4.sin<sup>2</sup>(r/2))
       * @param  pos      another position on the sphere
       * @return ||pos-this||<sup>2</sup> = 4.sin<sup>2</sup>(r/2)
       **/
      dist2: function dist2(pos) {
        //    	if ((this.x==0)&&(this.y==0)&&(this.z==0)) return(0./0.);
        //    	if ((pos.x==0)&&(pos.y==0)&&(pos.z==0)) return(0./0.);
        var w = pos.x - this.x;
        var r2 = w * w;
        w = pos.y - this.y;
        r2 += w * w;
        w = pos.z - this.z;
        r2 += w * w;
        return r2;
      },

      /**
       * Distance between 2 points on the sphere.
       * @param  pos another position on the sphere
       * @return distance in degrees in range [0, 180]
       **/
      distance: function distance(pos) {
        // Take care of NaN:
        if (pos.x == 0 && pos.y == 0 && pos.z == 0) return 0 / 0;
        if (this.x == 0 && this.y == 0 && this.z == 0) return 0 / 0;
        return 2 * AstroMath.asind(0.5 * Math.sqrt(this.dist2(pos)));
      },

      /**
       * Transform the position into another frame.
       * @param new_frame	The frame of the resulting position.
       **/
      convertTo: function convertTo(new_frame) {
        // Verify first if frames identical -- then nothing to do !
        if (this.frame.equals(new_frame)) {
          return;
        } // Move via ICRS

        this.frame.toICRS(this.coo); // Position now in ICRS

        new_frame.fromICRS(this.coo); // Position now in new_frame

        this.frame = new_frame;
        this.lon = this.lat = 0 / 0; // Actual angles not recomputed
      },

      /**
       * Rotate a coordinate (apply a rotation to the position).
       * @param R [3][3] Rotation Matrix
       */
      rotate: function rotate(R) {
        var X, Y, Z;
        if (R == Umatrix3) return;
        X = R[0][0] * this.x + R[0][1] * this.y + R[0][2] * this.z;
        Y = R[1][0] * this.x + R[1][1] * this.y + R[1][2] * this.z;
        Z = R[2][0] * this.x + R[2][1] * this.y + R[2][2] * this.z; // this.set(X, Y, Z); Not necessary to compute positions each time.

        this.x = X;
        this.y = Y;
        this.z = Z;
        this.lon = this.lat = 0 / 0;
      },

      /**
       * Rotate a coordinate (apply a rotation to the position) in reverse direction.
       * The method is the inverse of rotate.
       * @param R [3][3] Rotation Matrix
       */
      rotate_1: function rotate_1(R) {
        var X, Y, Z;
        if (R == Umatrix3) return;
        X = R[0][0] * this.x + R[1][0] * this.y + R[2][0] * this.z;
        Y = R[0][1] * this.x + R[1][1] * this.y + R[2][1] * this.z;
        Z = R[0][2] * this.x + R[1][2] * this.y + R[2][2] * this.z; // this.set(X, Y, Z); Not necessary to compute positions each time.

        this.x = X;
        this.y = Y;
        this.z = Z;
        this.lon = this.lat = 0 / 0;
      },

      /**
       * Test equality of Coo.
       * @param coo Second coordinate to compare with
       * @return  True if the two coordinates are equal
       */
      equals: function equals(coo) {
        return this.x == coo.x && this.y == coo.y && this.z == coo.z;
      },

      /**
       * parse a coordinate string. The coordinates can be in decimal or sexagesimal
       * @param str string to parse
       * @return true if the parsing succeded, false otherwise
       */
      parse: function parse(str) {
        var p = str.indexOf("+");
        if (p < 0) p = str.indexOf("-");
        if (p < 0) p = str.indexOf(" ");

        if (p < 0) {
          this.lon = 0.0 / 0.0;
          this.lat = 0.0 / 0.0;
          this.prec = 0;
          return false;
        }

        var strlon = str.substring(0, p);
        var strlat = str.substring(p);
        this.lon = this.parseLon(strlon); // sets the precision parameter

        this.lat = this.parseLat(strlat); // sets the precision parameter

        return true;
      },
      parseLon: function parseLon(str) {
        var str = str.trim();
        str = str.replace(/:/g, " ");

        if (str.indexOf(" ") < 0) {
          // The longitude is a integer or decimal number
          var p = str.indexOf(".");
          this.prec = p < 0 ? 0 : str.length - p - 1;
          return parseFloat(str);
        } else {
          var stok = new Tokenizer(str, " ");
          var i = 0;
          var l = 0;
          var pr = 0;

          while (stok.hasMore()) {
            var tok = stok.nextToken();
            var dec = tok.indexOf(".");
            l += parseFloat(tok) * coo_Coo.factor[i]; //				pr = dec < 0 ? 1 : 2;

            switch (i) {
              case 0:
                pr = dec < 0 ? 1 : 2;
                break;

              case 1:
                pr = dec < 0 ? 3 : 4;
                break;

              case 2:
                pr = dec < 0 ? 5 : 4 + tok.length - dec;

              default:
                break;
            }

            i++;
          }

          this.prec = pr;
          return (l * 15) / 3600.0;
        }
      },
      parseLat: function parseLat(str) {
        var str = str.trim();
        str = str.replace(/:/g, " ");
        var sign;

        if (str.charAt(0) == "-") {
          sign = -1;
          str = str.substring(1);
        } else if (str.charAt(0) == "-") {
          sign = 1;
          str = str.substring(1);
        } else {
          // No sign specified
          sign = 1;
        }

        if (str.indexOf(" ") < 0) {
          // The longitude is a integer or decimal number
          var p = str.indexOf(".");
          this.prec = p < 0 ? 0 : str.length - p - 1;
          return parseFloat(str) * sign;
        } else {
          var stok = new Tokenizer(str, " ");
          var i = 0;
          var l = 0;
          var pr = 0;

          while (stok.hasMore()) {
            var tok = stok.nextToken();
            var dec = tok.indexOf(".");
            l += parseFloat(tok) * coo_Coo.factor[i];

            switch (i) {
              case 0:
                pr = dec < 0 ? 1 : 2;
                break;

              case 1:
                pr = dec < 0 ? 3 : 4;
                break;

              case 2:
                pr = dec < 0 ? 5 : 4 + tok.length - dec;

              default:
                break;
            }

            i++;
          }

          this.prec = pr;
          return (l * sign) / 3600.0;
        }
      },

      /**
       * Format coordinates according to the options
       * @param options 'd': decimal, 's': sexagésimal, '/': space separated, '2': return [ra,dec] in an array
       * @return the formatted coordinates
       */
      format: function format(options) {
        if (isNaN(this.lon)) this.computeLonLat();
        var strlon = "",
          strlat = "";

        if (options.indexOf("d") >= 0) {
          // decimal display
          strlon = Numbers.format(this.lon, this.prec);
          strlat = Numbers.format(this.lat, this.prec);
        } else {
          // sexagesimal display
          var hlon = this.lon / 15.0;
          var strlon = Numbers.toSexagesimal(hlon, this.prec + 1, false);
          var strlat = Numbers.toSexagesimal(this.lat, this.prec, false);
        }

        if (this.lat > 0) strlat = "+" + strlat;

        if (options.indexOf("/") >= 0) {
          return strlon + " " + strlat;
        } else if (options.indexOf("2") >= 0) {
          return [strlon, strlat];
        }

        return strlon + strlat;
      },
    };
    /**
 * Distance between 2 points on the sphere.
 * @param coo1 firs	var coslat = AstroMath.cosd(this.lat);

	this.x = coslat*AstroMath.cosd(this.lon);
	this.y = coslat*AstroMath.sind(this.lon);
	this.z = AstroMath.sind(this.lat);
t coordinates point
 * @param coo2 second coordinates point
 * @return distance in degrees in range [0, 180]
**/

    /*
Coo.distance = function(Coo coo1, Coo coo2) {
	return Coo.distance(coo1.lon, coo1.lat, coo2.lon, coo2.lat);
}
*/

    /**
     * Distance between 2 points on the sphere.
     * @param lon1 longitude of first point in degrees
     * @param lat1 latitude of first point in degrees
     * @param lon2 longitude of second point in degrees
     * @param lat2 latitude of second point in degrees
     * @return distance in degrees in range [0, 180]
     **/

    /*
Coo.distance = function(lon1, lat1, lon2, lat2) {
	var c1 = AstroMath.cosd(lat1);
	var c2 = AstroMath.cosd(lat2);

	var w, r2;
	w = c1 * AstroMath.cosd(lon1) - c2 * AstroMath.cosd(lon2);
	r2 = w*w;
	w = c1 * AstroMath.sind(lon1) - c2 * AstroMath.sind(lon2);
	r2 += w*w;
	w = AstroMath.sind(lat1) - AstroMath.sind(lat2);
	r2 += w*w;

	return 2. * AstroMath.asind(0.5 * Math.sqrt(r2));
}


//===================================
// Class Tokenizer (similar to Java)
//===================================

/**
 * Constructor
 * @param str String to tokenize
 * @param sep token separator char
 */

    function Tokenizer(str, sep) {
      this.string = Strings.trim(str, sep);
      this.sep = sep;
      this.pos = 0;
    }

    Tokenizer.prototype = {
      /**
       * Check if the string has more tokens
       * @return true if a token remains (read with nextToken())
       */
      hasMore: function hasMore() {
        return this.pos < this.string.length;
      },

      /**
       * Returns the next token (as long as hasMore() is true)
       * @return the token string
       */
      nextToken: function nextToken() {
        // skip all the separator chars
        var p0 = this.pos;

        while (p0 < this.string.length && this.string.charAt(p0) == this.sep) {
          p0++;
        }

        var p1 = p0; // get the token

        while (p1 < this.string.length && this.string.charAt(p1) != this.sep) {
          p1++;
        }

        this.pos = p1;
        return this.string.substring(p0, p1);
      },
    }; //================================
    // Class Strings (static methods)
    //================================

    function Strings() {}
    /**
     * Removes a given char at the beginning and the end of a string
     * @param str string to trim
     * @param c char to remove
     * @return the trimmed string
     */

    Strings.trim = function (str, c) {
      var p0 = 0,
        p1 = str.length - 1;

      while (p0 < str.length && str.charAt(p0) == c) {
        p0++;
      }

      if (p0 == str.length) return "";

      while (p1 > p0 && str.charAt(p1) == c) {
        p1--;
      }

      return str.substring(p0, p1 + 1);
    }; //================================
    // Class Numbers (static methods)
    //================================

    function Numbers() {} //                0  1   2    3     4      5       6        7         8          9

    Numbers.pow10 = [
      1,
      10,
      100,
      1000,
      10000,
      100000,
      1000000,
      10000000,
      100000000,
      1000000000, //      10           11            12             13              14
      10000000000,
      100000000000,
      1000000000000,
      10000000000000,
      100000000000000,
    ]; //                 0    1     2      3       4        5         6          7

    Numbers.rndval = [
      0.5,
      0.05,
      0.005,
      0.0005,
      0.00005,
      0.000005,
      0.0000005,
      0.00000005, //      8            9             10             11              12
      0.000000005,
      0.0000000005,
      0.00000000005,
      0.000000000005,
      0.0000000000005, //      13                14
      0.00000000000005,
      0.00000000000005,
    ];
    /**
     * Format a integer or decimal number, adjusting the value with 'prec' decimal digits
     * @param num number (integer or decimal)
     * @param prec precision (= number of decimal digit to keep or append)
     * @return a string with the formatted number
     */

    Numbers.format = function (num, prec) {
      if (prec <= 0) {
    7   // Return an integer number
        return Math.round(num).toString();
      }

      var str = num.toString();
      var p = str.indexOf(".");
      var nbdec = p >= 0 ? str.length - p - 1 : 0;

      if (prec >= nbdec) {
        if (p < 0) str += ".";

        for (var i = 0; i < prec - nbdec; i++) {
          str += "0";
        }

        return str;
      } // HERE: prec > 0 and prec < nbdec

      str = (num + Numbers.rndval[prec]).toString();
      return str.substr(0, p + prec + 1);
    };
    /**
     * Convert a decimal coordinate into sexagesimal string, according to the given precision<br>
     * 8: 1/1000th sec, 7: 1/100th sec, 6: 1/10th sec, 5: sec, 4: 1/10th min, 3: min, 2: 1/10th deg, 1: deg
     * @param num number (integer or decimal)
     * @param prec precision (= number of decimal digit to keep or append)
     * @param plus if true, the '+' sign is displayed
     * @return a string with the formatted sexagesimal number
     */

    Numbers.toSexagesimal = function (num, prec, plus) {
      var resu = "";
      var sign = num < 0 ? "-" : plus ? "+" : "";
      var n = Math.abs(num);

      switch (prec) {
        case 1:
          // deg
          var n1 = Math.round(n);
          return sign + n1.toString();

        case 2:
          // deg.d
          return sign + Numbers.format(n, 1);

        case 3:
          // deg min
          var n1 = Math.floor(n);
          var n2 = Math.round((n - n1) * 60);
          return sign + n1 + " " + n2;

        case 4:
          // deg min.d
          var n1 = Math.floor(n);
          var n2 = (n - n1) * 60;
          return sign + n1 + " " + Numbers.format(n2, 1);

        case 5:
          // deg min sec
          var n1 = Math.floor(n); // d

          var n2 = (n - n1) * 60; // M.d

          var n3 = Math.floor(n2); // M

          var n4 = Math.round((n2 - n3) * 60); // S

          return sign + n1 + " " + n3 + " " + n4;

        case 6: // deg min sec.d

        case 7: // deg min sec.dd

        case 8:
          // deg min sec.ddd
          var n1 = Math.floor(n); // d

          if (n1 < 10) n1 = "0" + n1;
          var n2 = (n - n1) * 60; // M.d

          var n3 = Math.floor(n2); // M

          if (n3 < 10) n3 = "0" + n3;
          var n4 = (n2 - n3) * 60; // S.ddd

          return sign + n1 + " " + n3 + " " + Numbers.format(n4, prec - 5);

        default:
          return sign + Numbers.format(n, 1);
      }
    }; // CONCATENATED MODULE: ./src/js/SimbadPointer.js
    // Copyright 2018 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File SimbadPointer.js
     *
     * The SIMBAD pointer will query Simbad for a given position and radius and
     * return information on the object with
     *
     * Author: Thomas Boch [CDS]
     *
     *****************************************************************************/

    var SimbadPointer = (function () {
      var SimbadPointer = {};
      SimbadPointer.MIRRORS = [
        "https://alasky.u-strasbg.fr/cgi/simbad-flat/simbad-quick.py",
        "https://alaskybis.u-strasbg.fr/cgi/simbad-flat/simbad-quick.py",
      ]; // list of base URL for Simbad pointer service

      SimbadPointer.query = function (ra, dec, radiusDegrees, aladinInstance) {
        var coo = new coo_Coo(ra, dec, 7);
        var params = {
          Ident: coo.format("s/"),
          SR: radiusDegrees,
        };

        var successCallback = function successCallback(result) {
          aladinInstance.view.setCursor("pointer");
          var regexp = /(.*?)\/(.*?)\((.*?),(.*?)\)/g;
          var match = regexp.exec(result);

          if (match) {
            var objCoo = new coo_Coo();
            objCoo.parse(match[1]);
            var objName = match[2];
            var title =
              '<div class="aladin-sp-title"><a target="_blank" href="http://simbad.u-strasbg.fr/simbad/sim-id?Ident=' +
              encodeURIComponent(objName) +
              '">' +
              objName +
              "</a></div>";
            var content = '<div class="aladin-sp-content">';
            content += "<em>Type: </em>" + match[4] + "<br>";
            var magnitude = match[3];

            if (Utils.isNumber(magnitude)) {
              content += "<em>Mag: </em>" + magnitude + "<br>";
            }

            content +=
              '<br><a target="_blank" href="http://cdsportal.u-strasbg.fr/?target=' + encodeURIComponent(objName) + '">Query in CDS portal</a>';
            content += "</div>";
            aladinInstance.showPopup(objCoo.lon, objCoo.lat, title, content);
          } else {
            aladinInstance.hidePopup();
          }
        };

        var failureCallback = function failureCallback() {
          aladinInstance.view.setCursor("pointer");
          aladinInstance.hidePopup();
        };

        Utils.loadFromMirrors(SimbadPointer.MIRRORS, {
          data: params,
          onSuccess: successCallback,
          onFailure: failureCallback,
          timeout: 5,
        });
      };

      return SimbadPointer;
    })(); // CONCATENATED MODULE: ./src/js/libs/Stats.js
    // stats.js r6 - http://github.com/mrdoob/stats.js
    var Stats = function Stats() {
      function s(a, g, d) {
        var f, c, e;

        for (c = 0; c < 30; c++) {
          for (f = 0; f < 73; f++) {
            (e = (f + c * 74) * 4), (a[e] = a[e + 4]), (a[e + 1] = a[e + 5]), (a[e + 2] = a[e + 6]);
          }
        }

        for (c = 0; c < 30; c++) {
          (e = (73 + c * 74) * 4),
            c < g
              ? ((a[e] = b[d].bg.r), (a[e + 1] = b[d].bg.g), (a[e + 2] = b[d].bg.b))
              : ((a[e] = b[d].fg.r), (a[e + 1] = b[d].fg.g), (a[e + 2] = b[d].fg.b));
        }
      }

      var r = 0,
        t = 2,
        g,
        u = 0,
        j = new Date().getTime(),
        F = j,
        v = j,
        l = 0,
        w = 1e3,
        x = 0,
        k,
        d,
        a,
        m,
        y,
        n = 0,
        z = 1e3,
        A = 0,
        f,
        c,
        o,
        B,
        p = 0,
        C = 1e3,
        D = 0,
        h,
        i,
        q,
        E,
        b = {
          fps: {
            bg: {
              r: 16,
              g: 16,
              b: 48,
            },
            fg: {
              r: 0,
              g: 255,
              b: 255,
            },
          },
          ms: {
            bg: {
              r: 16,
              g: 48,
              b: 16,
            },
            fg: {
              r: 0,
              g: 255,
              b: 0,
            },
          },
          mb: {
            bg: {
              r: 48,
              g: 16,
              b: 26,
            },
            fg: {
              r: 255,
              g: 0,
              b: 128,
            },
          },
        };
      g = document.createElement("div");
      g.style.cursor = "pointer";
      g.style.width = "80px";
      g.style.opacity = "0.9";
      g.style.zIndex = "10001";
      g.addEventListener(
        "click",
        function () {
          r++;
          r == t && (r = 0);
          k.style.display = "none";
          f.style.display = "none";
          h.style.display = "none";

          switch (r) {
            case 0:
              k.style.display = "block";
              break;

            case 1:
              f.style.display = "block";
              break;

            case 2:
              h.style.display = "block";
          }
        },
        !1
      );
      k = document.createElement("div");
      k.style.backgroundColor = "rgb(" + Math.floor(b.fps.bg.r / 2) + "," + Math.floor(b.fps.bg.g / 2) + "," + Math.floor(b.fps.bg.b / 2) + ")";
      k.style.padding = "2px 0px 3px 0px";
      g.appendChild(k);
      d = document.createElement("div");
      d.style.fontFamily = "Helvetica, Arial, sans-serif";
      d.style.textAlign = "left";
      d.style.fontSize = "9px";
      d.style.color = "rgb(" + b.fps.fg.r + "," + b.fps.fg.g + "," + b.fps.fg.b + ")";
      d.style.margin = "0px 0px 1px 3px";
      d.innerHTML = '<span style="font-weight:bold">FPS</span>';
      k.appendChild(d);
      a = document.createElement("canvas");
      a.width = 74;
      a.height = 30;
      a.style.display = "block";
      a.style.marginLeft = "3px";
      k.appendChild(a);
      m = a.getContext("2d");
      m.fillStyle = "rgb(" + b.fps.bg.r + "," + b.fps.bg.g + "," + b.fps.bg.b + ")";
      m.fillRect(0, 0, a.width, a.height);
      y = m.getImageData(0, 0, a.width, a.height);
      f = document.createElement("div");
      f.style.backgroundColor = "rgb(" + Math.floor(b.ms.bg.r / 2) + "," + Math.floor(b.ms.bg.g / 2) + "," + Math.floor(b.ms.bg.b / 2) + ")";
      f.style.padding = "2px 0px 3px 0px";
      f.style.display = "none";
      g.appendChild(f);
      c = document.createElement("div");
      c.style.fontFamily = "Helvetica, Arial, sans-serif";
      c.style.textAlign = "left";
      c.style.fontSize = "9px";
      c.style.color = "rgb(" + b.ms.fg.r + "," + b.ms.fg.g + "," + b.ms.fg.b + ")";
      c.style.margin = "0px 0px 1px 3px";
      c.innerHTML = '<span style="font-weight:bold">MS</span>';
      f.appendChild(c);
      a = document.createElement("canvas");
      a.width = 74;
      a.height = 30;
      a.style.display = "block";
      a.style.marginLeft = "3px";
      f.appendChild(a);
      o = a.getContext("2d");
      o.fillStyle = "rgb(" + b.ms.bg.r + "," + b.ms.bg.g + "," + b.ms.bg.b + ")";
      o.fillRect(0, 0, a.width, a.height);
      B = o.getImageData(0, 0, a.width, a.height);

      try {
        performance && performance.memory && performance.memory.totalJSHeapSize && (t = 3);
      } catch (G) {}

      h = document.createElement("div");
      h.style.backgroundColor = "rgb(" + Math.floor(b.mb.bg.r / 2) + "," + Math.floor(b.mb.bg.g / 2) + "," + Math.floor(b.mb.bg.b / 2) + ")";
      h.style.padding = "2px 0px 3px 0px";
      h.style.display = "none";
      g.appendChild(h);
      i = document.createElement("div");
      i.style.fontFamily = "Helvetica, Arial, sans-serif";
      i.style.textAlign = "left";
      i.style.fontSize = "9px";
      i.style.color = "rgb(" + b.mb.fg.r + "," + b.mb.fg.g + "," + b.mb.fg.b + ")";
      i.style.margin = "0px 0px 1px 3px";
      i.innerHTML = '<span style="font-weight:bold">MB</span>';
      h.appendChild(i);
      a = document.createElement("canvas");
      a.width = 74;
      a.height = 30;
      a.style.display = "block";
      a.style.marginLeft = "3px";
      h.appendChild(a);
      q = a.getContext("2d");
      q.fillStyle = "#301010";
      q.fillRect(0, 0, a.width, a.height);
      E = q.getImageData(0, 0, a.width, a.height);
      return {
        domElement: g,
        update: function update() {
          u++;
          j = new Date().getTime();
          n = j - F;
          z = Math.min(z, n);
          A = Math.max(A, n);
          s(B.data, Math.min(30, 30 - (n / 200) * 30), "ms");
          c.innerHTML = '<span style="font-weight:bold">' + n + " MS</span> (" + z + "-" + A + ")";
          o.putImageData(B, 0, 0);
          F = j;

          if (j > v + 1e3) {
            l = Math.round((u * 1e3) / (j - v));
            w = Math.min(w, l);
            x = Math.max(x, l);
            s(y.data, Math.min(30, 30 - (l / 100) * 30), "fps");
            d.innerHTML = '<span style="font-weight:bold">' + l + " FPS</span> (" + w + "-" + x + ")";
            m.putImageData(y, 0, 0);
            if (t == 3)
              (p = performance.memory.usedJSHeapSize * 9.54e-7),
                (C = Math.min(C, p)),
                (D = Math.max(D, p)),
                s(E.data, Math.min(30, 30 - p / 2), "mb"),
                (i.innerHTML = '<span style="font-weight:bold">' + Math.round(p) + " MB</span> (" + Math.round(C) + "-" + Math.round(D) + ")"),
                q.putImageData(E, 0, 0);
            v = j;
            u = 0;
          }
        },
      };
    }; // CONCATENATED MODULE: ./src/js/ColorMap.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File ColorMap.js
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var ColorMap = (function () {
      // constructor
      var ColorMap = function ColorMap(view) {
        this.view = view;
        this.reversed = false;
        this.mapName = "native";
        this.sig = this.signature();
      };

      ColorMap.MAPS = {};
      ColorMap.MAPS["eosb"] = {
        name: "Eos B",
        r: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 18, 27, 36, 45, 49, 57, 72, 81, 91, 100, 109, 118, 127, 136, 131, 139, 163, 173,
          182, 191, 200, 209, 218, 227, 213, 221, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229,
          255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255,
          229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255,
          255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 253, 251, 249, 247, 245, 243, 241, 215, 214, 235, 234, 232, 230,
          228, 226, 224, 222, 198, 196, 216, 215, 213, 211, 209, 207, 205, 203, 181, 179, 197, 196, 194, 192, 190, 188, 186, 184, 164, 162, 178, 176,
          175, 173, 171, 169, 167, 165, 147, 145, 159, 157, 156, 154, 152, 150, 148, 146, 130, 128, 140, 138, 137, 135, 133, 131, 129, 127, 113, 111,
          121, 119, 117, 117,
        ],
        g: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 15, 23, 31, 39, 47, 55, 57, 64, 79,
          87, 95, 103, 111, 119, 127, 135, 129, 136, 159, 167, 175, 183, 191, 199, 207, 215, 200, 207, 239, 247, 255, 255, 255, 255, 255, 255, 229,
          229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 250, 246, 242, 238, 233, 229,
          225, 198, 195, 212, 208, 204, 199, 195, 191, 187, 182, 160, 156, 169, 165, 161, 157, 153, 148, 144, 140, 122, 118, 127, 125, 123, 121, 119,
          116, 114, 112, 99, 97, 106, 104, 102, 99, 97, 95, 93, 91, 80, 78, 84, 82, 80, 78, 76, 74, 72, 70, 61, 59, 63, 61, 59, 57, 55, 53, 50, 48,
          42, 40, 42, 40, 38, 36, 33, 31, 29, 27, 22, 21, 21, 19, 16, 14, 12, 13, 8, 6, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
        ],
        b: [
          116, 121, 127, 131, 136, 140, 144, 148, 153, 157, 145, 149, 170, 174, 178, 182, 187, 191, 195, 199, 183, 187, 212, 216, 221, 225, 229, 233,
          238, 242, 221, 225, 255, 247, 239, 231, 223, 215, 207, 199, 172, 164, 175, 167, 159, 151, 143, 135, 127, 119, 100, 93, 95, 87, 79, 71, 63,
          55, 47, 39, 28, 21, 15, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
      };
      ColorMap.MAPS["rainbow"] = {
        name: "Rainbow",
        r: [
          0, 4, 9, 13, 18, 22, 27, 31, 36, 40, 45, 50, 54, 58, 61, 64, 68, 69, 72, 74, 77, 79, 80, 82, 83, 85, 84, 86, 87, 88, 86, 87, 87, 87, 85, 84,
          84, 84, 83, 79, 78, 77, 76, 71, 70, 68, 66, 60, 58, 55, 53, 46, 43, 40, 36, 33, 25, 21, 16, 12, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 12, 21, 25, 29, 33, 42,
          46, 51, 55, 63, 67, 72, 76, 80, 89, 93, 97, 101, 110, 114, 119, 123, 131, 135, 140, 144, 153, 157, 161, 165, 169, 178, 182, 187, 191, 199,
          203, 208, 212, 221, 225, 229, 233, 242, 246, 250, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255,
        ],
        g: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 16, 21, 25, 29, 38, 42, 46, 51, 55, 63, 67, 72, 76, 84, 89, 93, 97, 106, 110, 114, 119,
          127, 131, 135, 140, 144, 152, 157, 161, 165, 174, 178, 182, 187, 195, 199, 203, 208, 216, 220, 225, 229, 233, 242, 246, 250, 255, 255, 255,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 250, 242, 238, 233, 229, 221, 216, 212, 208, 199, 195, 191, 187, 178, 174, 170, 165,
          161, 153, 148, 144, 140, 131, 127, 123, 119, 110, 106, 102, 97, 89, 85, 80, 76, 72, 63, 59, 55, 51, 42, 38, 34, 29, 21, 17, 12, 8, 0,
        ],
        b: [
          0, 3, 7, 10, 14, 19, 23, 28, 32, 38, 43, 48, 53, 59, 63, 68, 72, 77, 89, 86, 91, 95, 100, 104, 109, 113, 118, 122, 127, 132, 136, 141, 145,
          150, 154, 159, 163, 168, 173, 177, 182, 186, 191, 195, 200, 204, 209, 214, 218, 223, 227, 232, 236, 241, 245, 250, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 246, 242, 238, 233, 225, 220,
          216, 212, 203, 199, 195, 191, 187, 178, 174, 170, 165, 157, 152, 148, 144, 135, 131, 127, 123, 114, 110, 106, 102, 97, 89, 84, 80, 76, 67,
          63, 59, 55, 46, 42, 38, 34, 25, 21, 16, 12, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
      };
      ColorMap.MAPS["cubehelix"] = {
        name: "Cubehelix",
        r: [
          0, 1, 3, 4, 6, 8, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20, 20, 21, 22, 23, 23, 24, 24, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26,
          25, 25, 25, 25, 24, 24, 24, 23, 23, 23, 23, 22, 22, 22, 21, 21, 21, 21, 21, 21, 20, 20, 20, 21, 21, 21, 21, 21, 22, 22, 22, 23, 23, 24, 25,
          26, 27, 27, 28, 30, 31, 32, 33, 35, 36, 38, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 60, 62, 65, 67, 70, 72, 75, 78, 81, 83, 86, 89, 92, 95,
          98, 101, 104, 107, 110, 113, 116, 120, 123, 126, 129, 132, 135, 138, 141, 144, 147, 150, 153, 155, 158, 161, 164, 166, 169, 171, 174, 176,
          178, 181, 183, 185, 187, 189, 191, 193, 194, 196, 198, 199, 201, 202, 203, 204, 205, 206, 207, 208, 209, 209, 210, 211, 211, 211, 212, 212,
          212, 212, 212, 212, 212, 212, 211, 211, 211, 210, 210, 210, 209, 208, 208, 207, 207, 206, 205, 205, 204, 203, 203, 202, 201, 201, 200, 199,
          199, 198, 197, 197, 196, 196, 195, 195, 194, 194, 194, 193, 193, 193, 193, 193, 193, 193, 193, 193, 193, 194, 194, 195, 195, 196, 196, 197,
          198, 199, 200, 200, 202, 203, 204, 205, 206, 208, 209, 210, 212, 213, 215, 217, 218, 2203 222, 223, 225, 227, 229, 231, 232, 234, 236, 238,
          240, 242, 244, 245, 247, 249, 251, 253, 255,
        ],
        g: [
          0, 0, 1, 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 9, 10, 11, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 24, 25, 26, 28, 29, 31, 32, 34, 35, 37, 38,
          40, 41, 43, 45, 46, 48, 50, 52, 53, 55, 57, 58, 60, 62, 64, 66, 67, 69, 71, 73, 74, 76, 78, 79, 81, 83, 84, 86, 88, 89, 91, 92, 94, 95, 97,
          98, 99, 101, 102, 103, 104, 106, 107, 108, 109, 110, 111, 112, 113, 114, 114, 115, 116, 116, 117, 118, 118, 119, 119, 120, 120, 120, 121,
          121, 121, 121, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 121, 121, 121, 121, 121, 121, 121, 121, 121, 120,
          120, 120, 120, 120, 120, 120, 120, 120, 120, 121, 121, 121, 121, 121, 122, 122, 122, 123, 123, 124, 124, 125, 125, 126, 127, 127, 128, 129,
          130, 131, 131, 132, 133, 135, 136, 137, 138, 139, 140, 142, 143, 144, 146, 147, 149, 150, 152, 154, 155, 157, 158, 160, 162, 164, 165, 167,
          169, 171, 172, 174, 176, 178, 180, 182, 183, 185, 187, 189, 191, 193, 194, 196, 198, 200, 202, 203, 205, 207, 208, 210, 212, 213, 215, 216,
          218, 219, 221, 222, 224, 225, 226, 228, 229, 230, 231, 232, 233, 235, 236, 237, 238, 239, 240, 240, 241, 242, 243, 244, 244, 245, 246, 247,
          247, 248, 248, 249, 250, 250, 251, 251, 252, 252, 253, 253, 254, 255,
        ],
        b: [
          0, 1, 3, 4, 6, 8, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 48, 50, 52, 54, 56, 57, 59, 60, 62, 63, 65,
          66, 67, 69, 70, 71, 72, 73, 74, 74, 75, 76, 76, 77, 77, 77, 78, 78, 78, 78, 78, 78, 78, 77, 77, 77, 76, 76, 75, 75, 74, 73, 73, 72, 71, 70,
          69, 68, 67, 66, 66, 65, 64, 63, 61, 60, 59, 58, 58, 57, 56, 55, 54, 53, 52, 51, 51, 50, 49, 49, 48, 48, 47, 47, 47, 46, 46, 46, 46, 46, 47,
          47, 47, 48, 48, 49, 50, 50, 51, 52, 53, 55, 56, 57, 59, 60, 62, 64, 65, 67, 69, 71, 74, 76, 78, 81, 83, 86, 88, 91, 94, 96, 99, 102, 105,
          108, 111, 114, 117, 120, 124, 127, 130, 133, 136, 140, 143, 146, 149, 153, 156, 159, 162, 165, 169, 172, 175, 178, 181, 184, 186, 189, 192,
          195, 197, 200, 203, 205, 207, 210, 212, 214, 216, 218, 220, 222, 224, 226, 227, 229, 230, 231, 233, 234, 235, 236, 237, 238, 239, 239, 240,
          241, 241, 242, 242, 242, 243, 243, 243, 243, 243, 243, 243, 243, 243, 243, 242, 242, 242, 242, 241, 241, 241, 241, 240, 240, 240, 239, 239,
          239, 239, 239, 238, 238, 238, 238, 238, 238, 238, 238, 239, 239, 239, 240, 240, 240, 241, 242, 242, 243, 244, 245, 246, 247, 248, 249, 250,
          252, 253, 255,
        ],
      };
      ColorMap.MAPS_CUSTOM = ["cubehelix", "eosb", "rainbow"];
      ColorMap.MAPS_NAMES = ["native", "grayscale"].concat(ColorMap.MAPS_CUSTOM);

      ColorMap.prototype.reverse = function (val) {
        if (val) {
          this.reversed = val;
        } else {
          this.reversed = !this.reversed;
        }

        this.sig = this.signature();
        this.view.requestRedraw();
      };

      ColorMap.prototype.signature = function () {
        var s = this.mapName;

        if (this.reversed) {
          s += " reversed";
        }

        return s;
      };

      ColorMap.prototype.update = function (mapName) {
        this.mapName = mapName;
        this.sig = this.signature();
        this.view.requestRedraw();
      };

      ColorMap.prototype.apply = function (img) {
        if (this.sig == "native") {
          return img;
        }

        if (img.cmSig == this.sig) {
          return img.cmImg; // return cached pixels
        }

        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var pixelData = imageData.data;
        var length = pixelData.length;
        var a, b, c;
        var switchCase = 3;

        if (this.mapName == "grayscale") {
          switchCase = 1;
        } else if (ColorMap.MAPS_CUSTOM.indexOf(this.mapName) >= 0) {
          switchCase = 2;
        }

        for (var i = 0; i < length; i += 4) {
          switch (switchCase) {
            case 1:
              a = b = c = AladinUtils.myRound((pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 3);
              break;

            case 2:
              if (this.reversed) {
                a = ColorMap.MAPS[this.mapName].r[255 - pixelData[i]];
                b = ColorMap.MAPS[this.mapName].g[255 - pixelData[i + 1]];
                c = ColorMap.MAPS[this.mapName].b[255 - pixelData[i + 2]];
              } else {
                a = ColorMap.MAPS[this.mapName].r[pixelData[i]];
                b = ColorMap.MAPS[this.mapName].g[pixelData[i + 1]];
                c = ColorMap.MAPS[this.mapName].b[pixelData[i + 2]];
              }

              break;

            default:
              a = pixelData[i];
              b = pixelData[i + 1];
              c = pixelData[i + 2];
          }

          if (switchCase != 2 && this.reversed) {
            a = 255 - a;
            b = 255 - b;
            c = 255 - c;
          }

          pixelData[i] = a;
          pixelData[i + 1] = b;
          pixelData[i + 2] = c;
        } //imageData.data = pixelData;  // not needed, and create an error in strict mode !

        ctx.putImageData(imageData, 0, 0); // cache image with color map applied

        img.cmSig = this.sig;
        img.cmImg = canvas;
        return img.cmImg;
      };

      return ColorMap;
    })(); // CONCATENATED MODULE: ./src/js/Footprint.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
4    *
     * File Footprint
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/
    var lastFootprintSelect;
    var Footprint = (function () {
      // constructor
      var Footprint = function Footprint(polygons) {
        this.polygons = polygons;
        this.overlay = null; // TODO : all graphic overlays should have an id

        this.id = "footprint-" + Utils.uuidv4();

        this.isShowing = true;
        this.isSelected = false;
      };

      Footprint.prototype.setName = function (name) {
        this.name = name;
      };

      Footprint.prototype.setOverlay = function (overlay) {
        this.overlay = overlay;
      };

      Footprint.prototype.show = function () {
        if (this.isShowing) {
          return;
        }

        this.isShowing = true;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Footprint.prototype.hide = function () {
        if (!this.isShowing) {
          return;
        }

        this.isShowing = false;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Footprint.prototype.dispatchClickEvent = function () {
        if (this.overlay) {
          // footprint selection code adapted from Fabrizio Giordano dev. from Serco for ESA/ESDC
          //window.dispatchEvent(new CustomEvent("footprintClicked", {
          this.overlay.view.aladinDiv.dispatchEvent(
            new CustomEvent("footprintClicked", {
              detail: {
                footprintId: this.id,
                overlayName: this.overlay.name,
              },
            })
          );
        }
      };

      Footprint.prototype.select = function () {
        if (lastFootprintSelect != undefined) {
          lastFootprintSelect.deselect();

          lastFootprintSelect = this;
        } else {
          lastFootprintSelect = this;
        }
        if (this.isSelected) {
          return;
        }

        this.isSelected = true;

        if (this.overlay) {
          // this.overlay.lineWidth = 5;
          // footprint selection code adapted from Fabrizio Giordano dev. from Serco for ESA/ESDC
          //window.dispatchEvent(new CustomEvent("footprintClicked", {
          // this.overlay.view.aladinDiv.dispatchEvent(
          //   new CustomEvent("footprintClicked", {
          //     detail: {
          //       footprintId: this.id,
          //       overlayName: this.overlay.name,
          //     },
          //   })
          // );

          this.overlay.reportChange();
        }
      };

      Footprint.prototype.deselect = function () {
        if (!this.isSelected) {
          return;
        }

        this.isSelected = false;

        if (this.overlay) {
          this.overlay.lineWidth = 1;

          this.overlay.reportChange();
        }
      };

      return Footprint;
    })(); // CONCATENATED MODULE: ./src/js/Circle.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File Circle
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    // TODO : Circle and Footprint should inherit from the same root object

    var Circle = (function () {
      // constructor
      var Circle = function Circle(centerRaDec, radiusDegrees, options) {
        options = options || {};
        this.color = options["color"] || undefined; // TODO : all graphic overlays should have an id

        this.id = "circle-" + Utils.uuidv4();
        this.setCenter(centerRaDec);
        this.setRadius(radiusDegrees);
        this.overlay = null;
        this.isShowing = true;
        this.isSelected = false;
      };

      Circle.prototype.setOverlay = function (overlay) {
        this.overlay = overlay;
      };

      Circle.prototype.show = function () {
        if (this.isShowing) {
          return;
        }

        this.isShowing = true;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Circle.prototype.hide = function () {
        if (!this.isShowing) {
          return;
        }

        this.isShowing = false;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Circle.prototype.dispatchClickEvent = function () {
        if (this.overlay) {
          // footprint selection code adapted from Fabrizio Giordano dev. from Serco for ESA/ESDC
          //window.dispatchEvent(new CustomEvent("footprintClicked", {
          this.overlay.view.aladinDiv.dispatchEvent(
            new CustomEvent("footprintClicked", {
              detail: {
                footprintId: this.id,
                overlayName: this.overlay.name,
              },
            })
          );
        }
      };

      Circle.prototype.select = function () {
        if (this.isSelected) {
          return;
        }

        this.isSelected = true;

        if (this.overlay) {
          /*
                  this.overlay.view.aladinDiv.dispatchEvent(new CustomEvent("footprintClicked", {
                      detail: {
                          footprintId: this.id,
                          overlayName: this.overlay.name
                      }
                  }));
      */
          this.overlay.reportChange();
        }
      };

      Circle.prototype.deselect = function () {
        if (!this.isSelected) {
          return;
        }

        this.isSelected = false;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Circle.prototype.setCenter = function (centerRaDec) {
        this.centerRaDec = centerRaDec;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Circle.prototype.setRadius = function (radiusDegrees) {
        this.radiusDegrees = radiusDegrees;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      }; // TODO

      Circle.prototype.draw = function (ctx, view, projection, frame, width, height, largestDim, zoomFactor, noStroke) {
        if (!this.isShowing) {
          return;
        }

        noStroke = noStroke === true || false;
        /*var centerXy;
    if (frame.system != CooFrameEnum.SYSTEMS.J2000) {
        var lonlat = CooConversion.J2000ToGalactic([this.centerRaDec[0], this.centerRaDec[1]]);
        centerXy = projection.project(lonlat[0], lonlat[1]);
    }
    else {
        centerXy = projection.project(this.centerRaDec[0], this.centerRaDec[1]);
    }
    if (!centerXy) {
        return;
    }
    var centerXyview = AladinUtils.xyToView(centerXy.X, centerXy.Y, width, height, largestDim, zoomFactor, false);*/

        var centerXyview = AladinUtils.radecToViewXy(this.centerRaDec[0], this.centerRaDec[1], view);

        if (!centerXyview) {
          // the center goes out of the projection
          // we do not draw it
          return;
        } // compute value of radius in pixels in current projection

        var ra = this.centerRaDec[0];
        var dec = this.centerRaDec[1] + (ra > 0 ? -this.radiusDegrees : this.radiusDegrees);
        /*
    var circlePtXy;
    if (frame.system != CooFrameEnum.SYSTEMS.J2000) {
        var lonlat = CooConversion.J2000ToGalactic([ra, dec]);
        circlePtXy = projection.project(lonlat[0], lonlat[1]);
    }
    else {
        circlePtXy = projection.project(ra, dec);
    }
    if (!circlePtXy) {
        return;
    }
    var circlePtXyView = AladinUtils.xyToView(circlePtXy.X, circlePtXy.Y, width, height, largestDim, zoomFactor, false);
    */

        var circlePtXyView = AladinUtils.radecToViewXy(ra, dec, view);

        if (!circlePtXyView) {
          // the circle border goes out of the projection
          // we do not draw it
          return;
        }

        var dx = circlePtXyView[0] - centerXyview[0];
        var dy = circlePtXyView[1] - centerXyview[1];
        var radiusInPix = Math.sqrt(dx * dx + dy * dy); // TODO : check each 4 point until show

        var baseColor = this.color;

        if (!baseColor && this.overlay) {
          baseColor = this.overlay.color;
        }

        if (!baseColor) {
          baseColor = "#ff0000";
        }

        if (this.isSelected) {
          ctx.strokeStyle = baseColor;
          // ctx.strokeStyle = Overlay.increaseBrightness(baseColor, 50);
        } else {
          ctx.strokeStyle = baseColor;
        }
        // 1. Find the spherical tangent vector going to the north

        ctx.beginPath();
        ctx.arc(centerXyview[0], centerXyview[1], radiusInPix, 0, 2 * Math.PI, false);

        if (!noStroke) {
          ctx.stroke();
        }
      };

      return Circle;
    })(); // CONCATENATED MODULE: ./src/js/libs/RequestAnimationFrame.js
    // requestAnimationFrame() shim by Paul Irish
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/

    /*export let requestAnimFrame = (function() {
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function( callback, element){
				window.setTimeout(callback, 1000 / 60);
			};
})();
*/
    var requestAnimFrame = (function () {
      return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame
      );
    })();
    // EXTERNAL MODULE: ./src/glsl/webgl2/catalogs/aitoff.vert
    var aitoff = __webpack_require__(9825);
    var aitoff_default = /*#__PURE__*/ __webpack_require__.n(aitoff);
    // EXTERNAL MODULE: ./src/glsl/webgl2/catalogs/mercator.vert
    var mercator = __webpack_require__(423);
    var mercator_default = /*#__PURE__*/ __webpack_require__.n(mercator);
    // EXTERNAL MODULE: ./src/glsl/webgl2/catalogs/arc.vert
    var arc = __webpack_require__(4831);
    var arc_default = /*#__PURE__*/ __webpack_require__.n(arc);
    // EXTERNAL MODULE: ./src/glsl/webgl2/catalogs/tan.vert
    var tan = __webpack_require__(9494);
    var tan_default = /*#__PURE__*/ __webpack_require__.n(tan);
    // EXTERNAL MODULE: ./src/glsl/webgl2/catalogs/mollweide.vert
    var mollweide = __webpack_require__(7892);
    var mollweide_default = /*#__PURE__*/ __webpack_require__.n(mollweide);
    // EXTERNAL MODULE: ./src/glsl/webgl2/catalogs/healpix.vert
    var healpix = __webpack_require__(610);
    var healpix_default = /*#__PURE__*/ __webpack_require__.n(healpix);
    // EXTERNAL MODULE: ./src/glsl/webgl2/catalogs/ortho.vert
    var ortho = __webpack_require__(3418);
    var ortho_default = /*#__PURE__*/ __webpack_require__.n(ortho);
    // EXTERNAL MODULE: ./src/glsl/webgl2/catalogs/ortho.frag
    var catalogs_ortho = __webpack_require__(7585);
    var catalogs_ortho_default = /*#__PURE__*/ __webpack_require__.n(catalogs_ortho);
    // EXTERNAL MODULE: ./src/glsl/webgl2/catalogs/catalog.frag
    var catalog = __webpack_require__(7624);
    var catalog_default = /*#__PURE__*/ __webpack_require__.n(catalog);
    // EXTERNAL MODULE: ./src/glsl/webgl2/colormaps/colormap.vert
    var colormap = __webpack_require__(652);
    var colormap_default = /*#__PURE__*/ __webpack_require__.n(colormap);
    // EXTERNAL MODULE: ./src/glsl/webgl2/colormaps/colormap.frag
    var colormaps_colormap = __webpack_require__(9820);
    var colormaps_colormap_default = /*#__PURE__*/ __webpack_require__.n(colormaps_colormap);
    // EXTERNAL MODULE: ./src/glsl/webgl2/grid/grid.vert
    var grid = __webpack_require__(2992);
    var grid_default = /*#__PURE__*/ __webpack_require__.n(grid);
    // EXTERNAL MODULE: ./src/glsl/webgl2/grid/aitoff.frag
    var grid_aitoff = __webpack_require__(1104);
    var grid_aitoff_default = /*#__PURE__*/ __webpack_require__.n(grid_aitoff);
    // EXTERNAL MODULE: ./src/glsl/webgl2/grid/mollweide.frag
    var grid_mollweide = __webpack_require__(1072);
    var grid_mollweide_default = /*#__PURE__*/ __webpack_require__.n(grid_mollweide);
    // EXTERNAL MODULE: ./src/glsl/webgl2/grid/ortho.frag
    var grid_ortho = __webpack_require__(4300);
    var grid_ortho_default = /*#__PURE__*/ __webpack_require__.n(grid_ortho);
    // EXTERNAL MODULE: ./src/glsl/webgl2/grid/mercator.frag
    var grid_mercator = __webpack_require__(1770);
    var grid_mercator_default = /*#__PURE__*/ __webpack_require__.n(grid_mercator);
    // EXTERNAL MODULE: ./src/glsl/webgl2/grid/arc.frag
    var grid_arc = __webpack_require__(5640);
    var grid_arc_default = /*#__PURE__*/ __webpack_require__.n(grid_arc);
    // EXTERNAL MODULE: ./src/glsl/webgl2/grid/tan.frag
    var grid_tan = __webpack_require__(1468);
    var grid_tan_default = /*#__PURE__*/ __webpack_require__.n(grid_tan);
    // EXTERNAL MODULE: ./src/glsl/webgl2/grid/grid_cpu.vert
    var grid_cpu = __webpack_require__(4579);
    var grid_cpu_default = /*#__PURE__*/ __webpack_require__.n(grid_cpu);
    // EXTERNAL MODULE: ./src/glsl/webgl2/grid/grid_cpu.frag
    var grid_grid_cpu = __webpack_require__(8371);
    var grid_grid_cpu_default = /*#__PURE__*/ __webpack_require__.n(grid_grid_cpu);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/raytracer/raytracer.vert
    var raytracer = __webpack_require__(1783);
    var raytracer_default = /*#__PURE__*/ __webpack_require__.n(raytracer);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/raytracer/color.frag
    var color = __webpack_require__(7935);
    var color_default = /*#__PURE__*/ __webpack_require__.n(color);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/raytracer/grayscale_to_color.frag
    var grayscale_to_color = __webpack_require__(4215);
    var grayscale_to_color_default = /*#__PURE__*/ __webpack_require__.n(grayscale_to_color);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/raytracer/grayscale_to_colormap.frag
    var grayscale_to_colormap = __webpack_require__(2187);
    var grayscale_to_colormap_default = /*#__PURE__*/ __webpack_require__.n(grayscale_to_colormap);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/raytracer/grayscale_to_color_i.frag
    var grayscale_to_color_i = __webpack_require__(757);
    var grayscale_to_color_i_default = /*#__PURE__*/ __webpack_require__.n(grayscale_to_color_i);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/raytracer/grayscale_to_colormap_i.frag
    var grayscale_to_colormap_i = __webpack_require__(1726);
    var grayscale_to_colormap_i_default = /*#__PURE__*/ __webpack_require__.n(grayscale_to_colormap_i);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/raytracer/grayscale_to_color_u.frag
    var grayscale_to_color_u = __webpack_require__(5493);
    var grayscale_to_color_u_default = /*#__PURE__*/ __webpack_require__.n(grayscale_to_color_u);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/raytracer/grayscale_to_colormap_u.frag
    var grayscale_to_colormap_u = __webpack_require__(3090);
    var grayscale_to_colormap_u_default = /*#__PURE__*/ __webpack_require__.n(grayscale_to_colormap_u);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/raytracer/backcolor.vert
    var backcolor = __webpack_require__(5020);
    var backcolor_default = /*#__PURE__*/ __webpack_require__.n(backcolor);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/raytracer/backcolor.frag
    var raytracer_backcolor = __webpack_require__(5943);
    var raytracer_backcolor_default = /*#__PURE__*/ __webpack_require__.n(raytracer_backcolor);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/ortho.vert
    var rasterizer_ortho = __webpack_require__(2620);
    var rasterizer_ortho_default = /*#__PURE__*/ __webpack_require__.n(rasterizer_ortho);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/healpix.vert
    var rasterizer_healpix = __webpack_require__(1780);
    var rasterizer_healpix_default = /*#__PURE__*/ __webpack_require__.n(rasterizer_healpix);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/mercator.vert
    var rasterizer_mercator = __webpack_require__(5022);
    var rasterizer_mercator_default = /*#__PURE__*/ __webpack_require__.n(rasterizer_mercator);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/aitoff.vert
    var rasterizer_aitoff = __webpack_require__(3557);
    var rasterizer_aitoff_default = /*#__PURE__*/ __webpack_require__.n(rasterizer_aitoff);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/gnomonic.vert
    var gnomonic = __webpack_require__(3414);
    var gnomonic_default = /*#__PURE__*/ __webpack_require__.n(gnomonic);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/arc.vert
    var rasterizer_arc = __webpack_require__(3106);
    var rasterizer_arc_default = /*#__PURE__*/ __webpack_require__.n(rasterizer_arc);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/mollweide.vert
    var rasterizer_mollweide = __webpack_require__(3313);
    var rasterizer_mollweide_default = /*#__PURE__*/ __webpack_require__.n(rasterizer_mollweide);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/color.frag
    var rasterizer_color = __webpack_require__(7378);
    var rasterizer_color_default = /*#__PURE__*/ __webpack_require__.n(rasterizer_color);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/grayscale_to_color.frag
    var rasterizer_grayscale_to_color = __webpack_require__(1258);
    var rasterizer_grayscale_to_color_default = /*#__PURE__*/ __webpack_require__.n(rasterizer_grayscale_to_color);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/grayscale_to_colormap.frag
    var rasterizer_grayscale_to_colormap = __webpack_require__(6593);
    var rasterizer_grayscale_to_colormap_default = /*#__PURE__*/ __webpack_require__.n(rasterizer_grayscale_to_colormap);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/grayscale_to_color_i.frag
    var rasterizer_grayscale_to_color_i = __webpack_require__(37);
    var rasterizer_grayscale_to_color_i_default = /*#__PURE__*/ __webpack_require__.n(rasterizer_grayscale_to_color_i);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/grayscale_to_colormap_i.frag
    var rasterizer_grayscale_to_colormap_i = __webpack_require__(8567);
    var rasterizer_grayscale_to_colormap_i_default = /*#__PURE__*/ __webpack_require__.n(rasterizer_grayscale_to_colormap_i);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/grayscale_to_color_u.frag
    var rasterizer_grayscale_to_color_u = __webpack_require__(594);
    var rasterizer_grayscale_to_color_u_default = /*#__PURE__*/ __webpack_require__.n(rasterizer_grayscale_to_color_u);
    // EXTERNAL MODULE: ./src/glsl/webgl2/hips/rasterizer/grayscale_to_colormap_u.frag
    var rasterizer_grayscale_to_colormap_u = __webpack_require__(3206);
    var rasterizer_grayscale_to_colormap_u_default = /*#__PURE__*/ __webpack_require__.n(rasterizer_grayscale_to_colormap_u); // CONCATENATED MODULE: ./src/js/ShadersWebGL2.js
    /* Import all the shaders here*/
    // Catalog shaders

    // Colormap shaders

    // Grid shader

    // HiPS shaders
    // Raytracer

    // Rasterizer

    var shaders = [
      // Catalog shaders
      {
        id: "CatalogAitoffVS",
        content: aitoff_default(),
      },
      {
        id: "CatalogHEALPixVS",
        content: healpix_default(),
      },
      {
        id: "CatalogMercatVS",
        content: mercator_default(),
      },
      {
        id: "CatalogArcVS",
        content: arc_default(),
      },
      {
        id: "CatalogTanVS",
        content: tan_default(),
      },
      {
        id: "CatalogMollVS",
        content: mollweide_default(),
      },
      {
        id: "CatalogOrthoVS",
        content: ortho_default(),
      },
      {
        id: "CatalogOrthoFS",
        content: catalogs_ortho_default(),
      },
      {
        id: "CatalogFS",
        content: catalog_default(),
      }, // Colormap shaders
      {
        id: "ColormapCatalogVS",
        content: colormap_default(),
      },
      {
        id: "ColormapCatalogFS",
        content: colormaps_colormap_default(),
      }, // Grid shader
      {
        id: "GridVS",
        content: grid_default(),
      },
      {
        id: "GridAitoffFS",
        content: grid_aitoff_default(),
      },
      {
        id: "GridMollFS",
        content: grid_mollweide_default(),
      },
      {
        id: "GridOrthoFS",
        content: grid_ortho_default(),
      },
      {
        id: "GridMercatorFS",
        content: grid_mercator_default(),
      },
      {
        id: "GridArcFS",
        content: grid_arc_default(),
      },
      {
        id: "GridTanFS",
        content: grid_tan_default(),
      },
      {
        id: "GridFS_CPU",
        content: grid_grid_cpu_default(),
      },
      {
        id: "GridVS_CPU",
        content: grid_cpu_default(),
      }, // HiPS shaders
      // Raytracer
      {
        id: "RayTracerVS",
        content: raytracer_default(),
      },
      {
        id: "RayTracerColorFS",
        content: color_default(),
      },
      {
        id: "RayTracerGrayscale2ColorFS",
        content: grayscale_to_color_default(),
      },
      {
        id: "RayTracerGrayscale2ColormapFS",
        content: grayscale_to_colormap_default(),
      },
      {
        id: "RayTracerGrayscale2ColorIntegerFS",
        content: grayscale_to_color_i_default(),
      },
      {
        id: "RayTracerGrayscale2ColormapIntegerFS",
        content: grayscale_to_colormap_i_default(),
      },
      {
        id: "RayTracerGrayscale2ColorUnsignedFS",
        content: grayscale_to_color_u_default(),
      },
      {
        id: "RayTracerGrayscale2ColormapUnsignedFS",
        content: grayscale_to_colormap_u_default(),
      },
      {
        id: "RayTracerFontVS",
        content: backcolor_default(),
      },
      {
        id: "RayTracerFontFS",
        content: raytracer_backcolor_default(),
      }, /// Rasterizer
      {
        id: "RasterizerOrthoVS",
        content: rasterizer_ortho_default(),
      },
      {
        id: "RasterizerMercatorVS",
        content: rasterizer_mercator_default(),
      },
      {
        id: "RasterizerAitoffVS",
        content: rasterizer_aitoff_default(),
      },
      {
        id: "RasterizerHEALPixVS",
        content: rasterizer_healpix_default(),
      },
      {
        id: "RasterizerArcVS",
        content: rasterizer_arc_default(),
      },
      {
        id: "RasterizerGnomonicVS",
        content: gnomonic_default(),
      },
      {
        id: "RasterizerMollVS",
        content: rasterizer_mollweide_default(),
      },
      {
        id: "RasterizerColorFS",
        content: rasterizer_color_default(),
      },
      {
        id: "RasterizerGrayscale2ColorFS",
        content: rasterizer_grayscale_to_color_default(),
      },
      {
        id: "RasterizerGrayscale2ColormapFS",
        content: rasterizer_grayscale_to_colormap_default(),
      },
      {
        id: "RasterizerGrayscale2ColorIntegerFS",
        content: rasterizer_grayscale_to_color_i_default(),
      },
      {
        id: "RasterizerGrayscale2ColormapIntegerFS",
        content: rasterizer_grayscale_to_colormap_i_default(),
      },
      {
        id: "RasterizerGrayscale2ColorUnsignedFS",
        content: rasterizer_grayscale_to_color_u_default(),
      },
      {
        id: "RasterizerGrayscale2ColormapUnsignedFS",
        content: rasterizer_grayscale_to_colormap_u_default(),
      },
    ];
    function loadShadersWebGL2() {
      return shaders;
    } // CONCATENATED MODULE: ./src/img/kernel.png
    /* harmony default export */ const kernel = __webpack_require__.p + "ccdb93d24585bd08a4261722b95e9e3d.png"; // CONCATENATED MODULE: ./src/img/colormaps/colormaps.png
    /* harmony default export */ const colormaps = __webpack_require__.p + "5e9c973e186349126dbb60d66890dbeb.png"; // CONCATENATED MODULE: ./src/js/WebGL.js
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return (
        (_typeof =
          "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
            ? function (obj) {
                return typeof obj;
              }
            : function (obj) {
                return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
              }),
        _typeof(obj)
      );
    }

    function _regeneratorRuntime() {
      "use strict";
      /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime =
        function _regeneratorRuntime() {
          return exports;
        };
      var exports = {},
        Op = Object.prototype,
        hasOwn = Op.hasOwnProperty,
        $Symbol = "function" == typeof Symbol ? Symbol : {},
        iteratorSymbol = $Symbol.iterator || "@@iterator",
        asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
        toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
      function define(obj, key, value) {
        return (
          Object.defineProperty(obj, key, {
            value: value,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          }),
          obj[key]
        );
      }
      try {
        define({}, "");
      } catch (err) {
        define = function define(obj, key, value) {
          return (obj[key] = value);
        };
      }
      function wrap(innerFn, outerFn, self, tryLocsList) {
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
          generator = Object.create(protoGenerator.prototype),
          context = new Context(tryLocsList || []);
        return (
          (generator._invoke = (function (innerFn, self, context) {
            var state = "suspendedStart";
            return function (method, arg) {
              if ("executing" === state) throw new Error("Generator is already running");
              if ("completed" === state) {
                if ("throw" === method) throw arg;
                return doneResult();
              }
              for (context.method = method, context.arg = arg; ; ) {
                var delegate = context.delegate;
                if (delegate) {
                  var delegateResult = maybeInvokeDelegate(delegate, context);
                  if (delegateResult) {
                    if (delegateResult === ContinueSentinel) continue;
                    return delegateResult;
                  }
                }
                if ("next" === context.method) context.sent = context._sent = context.arg;
                else if ("throw" === context.method) {
                  if ("suspendedStart" === state) throw ((state = "completed"), context.arg);
                  context.dispatchException(context.arg);
                } else "return" === context.method && context.abrupt("return", context.arg);
                state = "executing";
                var record = tryCatch(innerFn, self, context);
                if ("normal" === record.type) {
                  if (((state = context.done ? "completed" : "suspendedYield"), record.arg === ContinueSentinel)) continue;
                  return { value: record.arg, done: context.done };
                }
                "throw" === record.type && ((state = "completed"), (context.method = "throw"), (context.arg = record.arg));
              }
            };
          })(innerFn, self, context)),
          generator
        );
      }
      function tryCatch(fn, obj, arg) {
        try {
          return { type: "normal", arg: fn.call(obj, arg) };
        } catch (err) {
          return { type: "throw", arg: err };
        }
      }
      exports.wrap = wrap;
      var ContinueSentinel = {};
      function Generator() {}
      function GeneratorFunction() {}
      function GeneratorFunctionPrototype() {}
      var IteratorPrototype = {};
      define(IteratorPrototype, iteratorSymbol, function () {
        return this;
      });
      var getProto = Object.getPrototypeOf,
        NativeIteratorPrototype = getProto && getProto(getProto(values([])));
      NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol) &&
        (IteratorPrototype = NativeIteratorPrototype);
      var Gp = (GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype));
      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function (method) {
          define(prototype, method, function (arg) {
            return this._invoke(method, arg);
          });
        });
      }
      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);
          if ("throw" !== record.type) {
            var result = record.arg,
              value = result.value;
            return value && "object" == _typeof(value) && hasOwn.call(value, "__await")
              ? PromiseImpl.resolve(value.__await).then(
                  function (value) {
                    invoke("next", value, resolve, reject);
                  },
                  function (err) {
                    invoke("throw", err, resolve, reject);
                  }
                )
              : PromiseImpl.resolve(value).then(
                  function (unwrapped) {
                    (result.value = unwrapped), resolve(result);
                  },
                  function (error) {
                    return invoke("throw", error, resolve, reject);
                  }
                );
          }
          reject(record.arg);
        }
        var previousPromise;
        this._invoke = function (method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }
          return (previousPromise = previousPromise
            ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg)
            : callInvokeWithMethodAndArg());
        };
      }
      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];
        if (undefined === method) {
          if (((context.delegate = null), "throw" === context.method)) {
            if (
              delegate.iterator["return"] &&
              ((context.method = "return"), (context.arg = undefined), maybeInvokeDelegate(delegate, context), "throw" === context.method)
            )
              return ContinueSentinel;
            (context.method = "throw"), (context.arg = new TypeError("The iterator does not provide a 'throw' method"));
          }
          return ContinueSentinel;
        }
        var record = tryCatch(method, delegate.iterator, context.arg);
        if ("throw" === record.type) return (context.method = "throw"), (context.arg = record.arg), (context.delegate = null), ContinueSentinel;
        var info = record.arg;
        return info
          ? info.done
            ? ((context[delegate.resultName] = info.value),
              (context.next = delegate.nextLoc),
              "return" !== context.method && ((context.method = "next"), (context.arg = undefined)),
              (context.delegate = null),
              ContinueSentinel)
            : info
          : ((context.method = "throw"),
            (context.arg = new TypeError("iterator result is not an object")),
            (context.delegate = null),
            ContinueSentinel);
      }
      function pushTryEntry(locs) {
        var entry = { tryLoc: locs[0] };
        1 in locs && (entry.catchLoc = locs[1]), 2 in locs && ((entry.finallyLoc = locs[2]), (entry.afterLoc = locs[3])), this.tryEntries.push(entry);
      }
      function resetTryEntry(entry) {
        var record = entry.completion || {};
        (record.type = "normal"), delete record.arg, (entry.completion = record);
      }
      function Context(tryLocsList) {
        (this.tryEntries = [{ tryLoc: "root" }]), tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
      }
      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];
          if (iteratorMethod) return iteratorMethod.call(iterable);
          if ("function" == typeof iterable.next) return iterable;
          if (!isNaN(iterable.length)) {
            var i = -1,
              next = function next() {
                for (; ++i < iterable.length; ) {
                  if (hasOwn.call(iterable, i)) return (next.value = iterable[i]), (next.done = !1), next;
                }
                return (next.value = undefined), (next.done = !0), next;
              };
            return (next.next = next);
          }
        }
        return { next: doneResult };
      }
      function doneResult() {
        return { value: undefined, done: !0 };
      }
      return (
        (GeneratorFunction.prototype = GeneratorFunctionPrototype),
        define(Gp, "constructor", GeneratorFunctionPrototype),
        define(GeneratorFunctionPrototype, "constructor", GeneratorFunction),
        (GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction")),
        (exports.isGeneratorFunction = function (genFun) {
          var ctor = "function" == typeof genFun && genFun.constructor;
          return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
        }),
        (exports.mark = function (genFun) {
          return (
            Object.setPrototypeOf
              ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype)
              : ((genFun.__proto__ = GeneratorFunctionPrototype), define(genFun, toStringTagSymbol, "GeneratorFunction")),
            (genFun.prototype = Object.create(Gp)),
            genFun
          );
        }),
        (exports.awrap = function (arg) {
          return { __await: arg };
        }),
        defineIteratorMethods(AsyncIterator.prototype),
        define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
          return this;
        }),
        (exports.AsyncIterator = AsyncIterator),
        (exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
          void 0 === PromiseImpl && (PromiseImpl = Promise);
          var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
          return exports.isGeneratorFunction(outerFn)
            ? iter
            : iter.next().then(function (result) {
                return result.done ? result.value : iter.next();
              });
        }),
        defineIteratorMethods(Gp),
        define(Gp, toStringTagSymbol, "Generator"),
        define(Gp, iteratorSymbol, function () {
          return this;
        }),
        define(Gp, "toString", function () {
          return "[object Generator]";
        }),
        (exports.keys = function (object) {
          var keys = [];
          for (var key in object) {
            keys.push(key);
          }
          return (
            keys.reverse(),
            function next() {
              for (; keys.length; ) {
                var key = keys.pop();
                if (key in object) return (next.value = key), (next.done = !1), next;
              }
              return (next.done = !0), next;
            }
          );
        }),
        (exports.values = values),
        (Context.prototype = {
          constructor: Context,
          reset: function reset(skipTempReset) {
            if (
              ((this.prev = 0),
              (this.next = 0),
              (this.sent = this._sent = undefined),
              (this.done = !1),
              (this.delegate = null),
              (this.method = "next"),
              (this.arg = undefined),
              this.tryEntries.forEach(resetTryEntry),
              !skipTempReset)
            )
              for (var name in this) {
                "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
              }
          },
          stop: function stop() {
            this.done = !0;
            var rootRecord = this.tryEntries[0].completion;
            if ("throw" === rootRecord.type) throw rootRecord.arg;
            return this.rval;
          },
          dispatchException: function dispatchException(exception) {
            if (this.done) throw exception;
            var context = this;
            function handle(loc, caught) {
              return (
                (record.type = "throw"),
                (record.arg = exception),
                (context.next = loc),
                caught && ((context.method = "next"), (context.arg = undefined)),
                !!caught
              );
            }
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i],
                record = entry.completion;
              if ("root" === entry.tryLoc) return handle("end");
              if (entry.tryLoc <= this.prev) {
                var hasCatch = hasOwn.call(entry, "catchLoc"),
                  hasFinally = hasOwn.call(entry, "finallyLoc");
                if (hasCatch && hasFinally) {
                  if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
                  if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
                } else if (hasCatch) {
                  if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
                } else {
                  if (!hasFinally) throw new Error("try statement without catch or finally");
                  if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
                }
              }
            }
          },
          abrupt: function abrupt(type, arg) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                var finallyEntry = entry;
                break;
              }
            }
            finallyEntry &&
              ("break" === type || "continue" === type) &&
              finallyEntry.tryLoc <= arg &&
              arg <= finallyEntry.finallyLoc &&
              (finallyEntry = null);
            var record = finallyEntry ? finallyEntry.completion : {};
            return (
              (record.type = type),
              (record.arg = arg),
              finallyEntry ? ((this.method = "next"), (this.next = finallyEntry.finallyLoc), ContinueSentinel) : this.complete(record)
            );
          },
          complete: function complete(record, afterLoc) {
            if ("throw" === record.type) throw record.arg;
            return (
              "break" === record.type || "continue" === record.type
                ? (this.next = record.arg)
                : "return" === record.type
                ? ((this.rval = this.arg = record.arg), (this.method = "return"), (this.next = "end"))
                : "normal" === record.type && afterLoc && (this.next = afterLoc),
              ContinueSentinel
            );
          },
          finish: function finish(finallyLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
            }
          },
          catch: function _catch(tryLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc === tryLoc) {
                var record = entry.completion;
                if ("throw" === record.type) {
                  var thrown = record.arg;
                  resetTryEntry(entry);
                }
                return thrown;
              }
            }
            throw new Error("illegal catch attempt");
          },
          delegateYield: function delegateYield(iterable, resultName, nextLoc) {
            return (
              (this.delegate = {
                iterator: values(iterable),
                resultName: resultName,
                nextLoc: nextLoc,
              }),
              "next" === this.method && (this.arg = undefined),
              ContinueSentinel
            );
          },
        }),
        exports
      );
    }

    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }
      if (info.done) {
        resolve(value);
      } else {
        Promise.resolve(value).then(_next, _throw);
      }
    }

    function _asyncToGenerator(fn) {
      return function () {
        var self = this,
          args = arguments;
        return new Promise(function (resolve, reject) {
          var gen = fn.apply(self, args);
          function _next(value) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }
          function _throw(err) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }
          _next(undefined);
        });
      };
    }

    //import { loadShadersWebGL1 } from "./ShadersWebGL1";
    // Import resources images

    var WebGLCtx = (function () {
      /** Constructor */
      function WebGLCtx() {
        return _WebGLCtx.apply(this, arguments);
      }

      function _WebGLCtx() {
        _WebGLCtx = _asyncToGenerator(
          /*#__PURE__*/ _regeneratorRuntime().mark(function _callee() {
            var webGL2support;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) {
                switch ((_context.prev = _context.next)) {
                  case 0:
                    // Check for webgl2 support
                    webGL2support = checkForWebGL2Support();

                    if (!webGL2support) {
                      _context.next = 7;
                      break;
                    }

                    _context.next = 4;
                    return __webpack_require__.e(/* import() */ 642).then(__webpack_require__.bind(__webpack_require__, 2642));

                  case 4:
                    return _context.abrupt("return", _context.sent);

                  case 7:
                    throw "WebGL2 not supported by your browser";

                  case 8:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          })
        );
        return _WebGLCtx.apply(this, arguments);
      }

      WebGLCtx.checkForWebGL2Support = checkForWebGL2Support;

      WebGLCtx.init = function (ctx, div) {
        //const shaders = WebGLCtx.checkForWebGL2Support() ? loadShadersWebGL2() : loadShadersWebGL1();
        var shaders = loadShadersWebGL2();
        return new ctx.WebClient(div, shaders, {
          kernel: kernel,
          colormaps: colormaps,
        });
      };

      return WebGLCtx;
    })();

    function checkForWebGL2Support() {
      var gl = document.createElement("canvas").getContext("webgl2");
      return gl;
      /*
  // Run WebGL1 version only
  return false;
  */
    } // CONCATENATED MODULE: ./src/js/Logger.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //
    // log
    var Logger = {};

    Logger.log = function (action, params) {
      try {
        var logUrl = "//alasky.unistra.fr/cgi/AladinLiteLogger/log.py";
        var paramStr = "";

        if (params) {
          paramStr = JSON.stringify(params);
        }

        $.ajax({
          url: logUrl,
          data: {
            action: action,
            params: paramStr,
            pageUrl: window.location.href,
            referer: document.referrer ? document.referrer : "",
          },
          method: "GET",
          dataType: "json", // as alasky supports CORS, we do not need JSONP any longer
        });
      } catch (e) {
        window.console && console.log("Exception: " + e);
      }
    }; // CONCATENATED MODULE: ./src/js/events/ALEvent.js
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true,
        });
      } else {
        obj[key] = value;
      }
      return obj;
    }

    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File events/ALEvent
     *
     * List of events emitted by Aladin Lite
     *
     * Author: Thomas Boch [CDS]
     *
     *****************************************************************************/
    var ALEvent = /*#__PURE__*/ (function () {
      function ALEvent(name) {
        _classCallCheck(this, ALEvent);

        this.name = name;
      }

      _createClass(ALEvent, [
        {
          key: "dispatchedTo",
          value: function dispatchedTo(domEl, options) {
            if (options) {
              domEl.dispatchEvent(
                new CustomEvent(this.name, {
                  detail: options,
                })
              );
            } else {
              domEl.dispatchEvent(new CustomEvent(this.name));
            }
          },
        },
        {
          key: "listenedBy",
          value: function listenedBy(domEl, fn) {
            domEl.addEventListener(this.name, fn);
          },
        },
        {
          key: "remove",
          value: function remove(domEl, fn) {
            domEl.removeEventListener(this.name, fn);
          },
        },
      ]);

      return ALEvent;
    })();

    _defineProperty(ALEvent, "COO_GRID_ENABLED", new ALEvent("AL:cooGrid.enabled"));

    _defineProperty(ALEvent, "COO_GRID_DISABLED", new ALEvent("AL:cooGrid.disabled"));

    _defineProperty(ALEvent, "COO_GRID_UPDATED", new ALEvent("AL:cooGrid.updated"));

    _defineProperty(ALEvent, "PROJECTION_CHANGED", new ALEvent("AL:projection.changed"));

    _defineProperty(ALEvent, "HIPS_LAYER_ADDED", new ALEvent("AL:HiPSLayer.added"));

    _defineProperty(ALEvent, "HIPS_LAYER_REMOVED", new ALEvent("AL:HiPSLayer.removed"));

    _defineProperty(ALEvent, "HIPS_LAYER_CHANGED", new ALEvent("AL:HiPSLayer.changed"));

    _defineProperty(ALEvent, "GRAPHIC_OVERLAY_LAYER_ADDED", new ALEvent("AL:GraphicOverlayLayer.added"));

    _defineProperty(ALEvent, "GRAPHIC_OVERLAY_LAYER_REMOVED", new ALEvent("AL:GraphicOverlayLayer.removed"));

    _defineProperty(ALEvent, "GRAPHIC_OVERLAY_LAYER_CHANGED", new ALEvent("AL:GraphicOverlayLayer.changed")); // CONCATENATED MODULE: ./src/js/View.js
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }

    function _nonIterableRest() {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
      );
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator]) || arr["@@iterator"];
      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;
      var _s, _e;
      try {
        for (_i = 5i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File View.js
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var View = (function () {
      /** Constructor */
      function View(aladin, location, fovDiv, cooFrame, zoom) {
        this.aladin = aladin; // Add a reference to the WebGL API

        this.options = aladin.options;
        this.aladinDiv = this.aladin.aladinDiv;
        this.popup = new Popup(this.aladinDiv, this);
        this.webGL2Support = WebGLCtx.checkForWebGL2Support();
        this.createCanvases(); // Init the WebGL context
        // At this point, the view has been created so the image canvas too

        try {
          // Start our Rust application. You can find `WebClient` in `src/lib.rs`
          // The Rust part should also create a new WebGL2 or WebGL1 context depending on the WebGL2 brower support.
          this.aladin.webglAPI = new WebGLCtx.init(Aladin.wasmLibs.webgl, this.aladinDiv.id);
        } catch (e) {
          // For browsers not supporting WebGL2:
          // 1. Print the original exception message in the console
          console.error(e); // 2. Add a more explicite message to the end user

          alert(
            "Problem initializing Aladin Lite. Please contact the support by contacting Matthieu Baumann (baumannmatthieu0@gmail.com) or Thomas Boch (thomas.boch@astro.unistra.fr). You can also open an issue on the Aladin Lite github repository here: https://github.com/cds-astro/aladin-lite. Message error:" +
              e
          );
        }

        this.location = location;
        this.fovDiv = fovDiv;
        this.mustClearCatalog = true; //this.imageSurveysToSet = [];

        this.mode = View.PAN;
        this.minFOV = this.maxFOV = null; // by default, no restriction

        this.fov_limit = 180.0;
        this.healpixGrid = new HealpixGrid();
        this.then = Date.now();
        var lon, lat;
        lon = lat = 0;
        this.projection = new Projection(lon, lat);
        this.projection.setProjection(ProjectionEnum.SIN); //this.zoomLevel = 0;
        // Prev time of the last frame

        this.prev = 0; //this.zoomFactor = this.computeZoomFactor(this.zoomLevel);

   5    this.zoomFactor = this.aladin.webglAPI.getClipZoomFactor();
        this.viewCenter = {
          lon: lon,
          lat: lat,
        }; // position of center of view

        if (cooFrame) {
          this.cooFrame = cooFrame;
        } else {
          this.cooFrame = CooFrameEnum.GAL;
        } // Frame setting

        this.changeFrame(this.cooFrame); // Zoom starting setting

        var si = 500000.0;
        var alpha = 40.0;
        var initialFov = zoom || 360.0;
        this.pinchZoomParameters = {
          isPinching: false,
          // true if a pinch zoom is ongoing
          initialFov: undefined,
          initialDistance: undefined,
          initialAccDelta: Math.pow(si / initialFov, 1.0 / alpha),
        };
        this.setZoom(initialFov); // current reference image survey displayed

        this.imageSurveys = new Map();
        this.imageSurveysWaitingList = new Map();
        this.imageSurveysIdx = new Map();
        this.overlayLayers = []; // current catalogs displayed

        this.catalogs = []; // a dedicated catalog for the popup

        var c = document.createElement("canvas");
        c.width = c.height = 24;
        var ctx = c.getContext("2d");
        ctx.lineWidth = 6.0;
        ctx.beginPath();
        ctx.strokeStyle = "#eee";
        ctx.arc(12, 12, 8, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.strokeStyle = "#c38";
        ctx.arc(12, 12, 8, 0, 2 * Math.PI, true);
        ctx.stroke();
        this.catalogForPopup = A.catalog({
          shape: c,
          sourceSize: 24,
        }); //this.catalogForPopup = A.catalog({sourceSize: 18, shape: 'circle', color: '#c38'});

        this.catalogForPopup.hide();
        this.catalogForPopup.setView(this); // overlays (footprints for instance)

        this.overlays = []; // MOCs

        this.mocs = []; // reference to all overlay layers (= catalogs + overlays + mocs)

        this.allOverlayLayers = [];
        this.fixLayoutDimensions();
        this.firstHiPS = true;
        this.curNorder = 1;
        this.realNorder = 1; // some variables for mouse handling

        this.dragging = false;
        this.dragx = null;
        this.dragy = null;
        this.rightclickx = null;
        this.rightclicky = null;
        this.selectedSurveyLayer = "base";
        this.needRedraw = true; // two-fingers rotation

        this.fingersRotationParameters = {
          initialViewAngleFromCenter: undefined,
          initialFingerAngle: undefined,
          rotationInitiated: false,
        };
        this.fadingLatestUpdate = null;
        this.dateRequestRedraw = null;
        init(this); // listen to window resize and reshape canvases

        this.resizeTimer = null;
        var self = this;
        $(window).resize(function () {
          self.fixLayoutDimensions(self);
          self.requestRedraw();
        }); // in some contexts (Jupyter notebook for instance), the parent div changes little time after Aladin Lite creation
        // this results in canvas dimension to be incorrect.
        // The following line tries to fix this issue

        setTimeout(function () {
          var computedWidth = $(self.aladinDiv).width();
          var computedHeight = $(self.aladinDiv).height();

          if (self.width !== computedWidth || self.height === computedHeight) {
            self.fixLayoutDimensions(); // As the WebGL backend has been resized correctly by
            // the previous call, we can get the zoom factor from it

            self.setZoom(self.fov); // needed to force recomputation of displayed FoV
          }
        }, 1000);
      } // different available modes

      View.PAN = 0;
      View.SELECT = 1;
      View.TOOL_SIMBAD_POINTER = 2; // TODO: should be put as an option at layer level

      View.DRAW_SOURCES_WHILE_DRAGGING = true;
      View.DRAW_MOCS_WHILE_DRAGGING = true;
      View.CALLBACKS_THROTTLE_TIME_MS = 100; // minimum time between two consecutive callback calls
      // (re)create needed canvases

      View.prototype.createCanvases = function () {
        var a = $(this.aladinDiv);
        a.find(".aladin-imageCanvas").remove();
        a.find(".aladin-catalogCanvas").remove(); // canvas to draw the images

        this.imageCanvas = $("<canvas class='aladin-imageCanvas'></canvas>").appendTo(this.aladinDiv)[0]; // canvas to draw the catalogs

        this.catalogCanvas = $("<canvas class='aladin-catalogCanvas'></canvas>").appendTo(this.aladinDiv)[0];
      }; // called at startup and when window is resized
      // The WebGL backend is resized

      View.prototype.fixLayoutDimensions = function () {
        Utils.cssScale = undefined;
        var computedWidth = $(this.aladinDiv).width();
        var computedHeight = $(this.aladinDiv).height();
        this.width = Math.max(computedWidth, 1);
        this.height = Math.max(computedHeight, 1); // this prevents many problems when div size is equal to 0

        this.cx = this.width / 2;
        this.cy = this.height / 2;
        this.largestDim = Math.max(this.width, this.height);
        this.smallestDim = Math.min(this.width, this.height);
        this.ratio = this.largestDim / this.smallestDim;
        this.mouseMoveIncrement = 160 / this.largestDim; // reinitialize 2D context

        this.imageCtx = this.imageCanvas.getContext(this.webGL2Support ? "webgl2" : "webgl");
        this.aladin.webglAPI.resize(this.width, this.height);
        this.catalogCtx = this.catalogCanvas.getContext("2d");
        this.catalogCtx.canvas.width = this.width;
        this.catalogCtx.canvas.height = this.height;
        pixelateCanvasContext(this.imageCtx, this.aladin.options.pixelateCanvas); // change logo

        if (!this.logoDiv) {
          this.logoDiv = $(this.aladinDiv).find(".aladin-logo")[0];
        }

        if (this.width > 800) {
          $(this.logoDiv).removeClass("aladin-logo-small");
          $(this.logoDiv).addClass("aladin-logo-large");
          $(this.logoDiv).css("width", "90px");
        } else {
          $(this.logoDiv).addClass("aladin-logo-small");
          $(this.logoDiv).removeClass("aladin-logo-large");
          $(this.logoDiv).css("width", "32px");
        }

        this.computeNorder();
      };

      var pixelateCanvasContext = function pixelateCanvasContext(ctx, pixelateFlag) {
        var enableSmoothing = !pixelateFlag;
        ctx.imageSmoothingEnabled = enableSmoothing;
        ctx.webkitImageSmoothingEnabled = enableSmoothing;
        ctx.mozImageSmoothingEnabled = enableSmoothing;
        ctx.msImageSmoothingEnabled = enableSmoothing;
        ctx.oImageSmoothingEnabled = enableSmoothing;
      };

      View.prototype.setMode = function (mode) {
        this.mode = mode;

        if (this.mode == View.SELECT) {
          this.setCursor("crosshair");
        } else if (this.mode == View.TOOL_SIMBAD_POINTER) {
          this.popup.hide();
          this.catalogCanvas.style.cursor = "";
          $(this.catalogCanvas).addClass("aladin-sp-cursor");
        } else {
          this.setCursor("default");
        }
      };

      View.prototype.setCursor = function (cursor) {
        if (this.catalogCanvas.style.cursor == cursor) {
          return;
        }

        if (this.mode == View.TOOL_SIMBAD_POINTER) {
          return;
        }

        this.catalogCanvas.style.cursor = cursor;
      };
      /**
       * return dataURL string corresponding to the current view
       */

      View.prototype.getCanvasDataURL = function (imgType, width, height) {
        imgType = imgType || "image/png";
        var c = document.createElement("canvas");
        width = width || this.width;
        height = height || this.height;
        c.width = width;
        c.height = height;
        var ctx = c.getContext("2d"); //ctx.drawImage(this.imageCanvas, 0, 0, c.width, c.height);

        var canvas = this.aladin.webglAPI.canvas();
        ctx.drawImage(canvas, 0, 0, c.width, c.height);
        ctx.drawImage(this.catalogCanvas, 0, 0, c.width, c.height);
        return c.toDataURL(imgType); //return c.toDataURL("image/jpeg", 0.01); // setting quality only works for JPEG (?)
      };

      View.prototype.setActiveHiPSLayer = function (layer) {
        if (!this.imageSurveys.has(layer)) {
          throw layer + " does not exists. So cannot be selected";
        }

        this.selectedSurveyLayer = layer;
      };

      View.prototype.updateFovDiv = function () {
        if (isNaN(this.fov)) {
          this.fovDiv.html("FoV:");
          return;
        } // update FoV value

        var fovStr;

        if (this.fov > 1) {
          fovStr = Math.round(this.fov * 100) / 100 + "°";
        } else if (this.fov * 60 > 1) {
          fovStr = Math.round(this.fov * 60 * 100) / 100 + "'";
        } else {
          fovStr = Math.round(this.fov * 3600 * 100) / 100 + '"';
        }

        this.fovDiv.html("FoV: " + fovStr);
      };

      var createListeners = function createListeners(view) {
        var hasTouchEvents = false;

        if ("ontouchstart" in window) {
          hasTouchEvents = true;
        } // various listeners

        var onDblClick = function onDblClick(e) {
          var xymouse = view.imageCanvas.relMouseCoords(e);
          /*if(view.aladin.webglAPI.posOnUi()) {
          return;
      }*/

          try {
            var lonlat = view.aladin.webglAPI.screenToWorld(xymouse.x, xymouse.y);
            var radec = view.aladin.webglAPI.viewToICRSJ2000CooSys(lonlat[0], lonlat[1]);
            view.pointTo(radec[0], radec[1], {
              forceAnimation: true,
            });
          } catch (err) {
            return;
          }
        };

        if (!hasTouchEvents) {
          $(view.catalogCanvas).dblclick(onDblClick);
        }

        $(view.catalogCanvas).bind(
          "contextmenu",
          function (e) {
            // do something here...
            e.preventDefault();
          },
          false
        );
        var cutMinInit = null;
        var cutMaxInit = null;
        $(view.catalogCanvas).bind("mousedown touchstart", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var xymouse = view.imageCanvas.relMouseCoords(e);

          if (e.which === 3 || e.button === 2) {
            view.rightClick = true;
            view.rightclickx = xymouse.x;
            view.rightclicky = xymouse.y;
            var survey = view.imageSurveys.get(view.selectedSurveyLayer);

            if (survey) {
              // Take as start cut values what is inside the properties
              // If the cuts are not defined in the metadata of the survey
              // then we take what has been defined by the user
              if (!survey.colored) {
                if (survey.fits) {
                  // properties default cuts always refers to fits tiles
                  cutMinInit = survey.properties.minCutout || survey.options.minCut;
                  cutMaxInit = survey.properties.maxCutout || survey.options.maxCut;
                } else {
                  cutMinInit = survey.options.minCut;
                  cutMaxInit = survey.options.maxCut;
                }
              } else {
                // todo: contrast
              }
            }

            return;
          } // zoom pinching

          if (e.type === "touchstart" && e.originalEvent && e.originalEvent.targetTouches && e.originalEvent.targetTouches.length == 2) {
            view.dragging = false;
            view.pinchZoomParameters.isPinching = true; //var fov = view.aladin.getFov();
            //view.pinchZoomParameters.initialFov = Math.max(fov[0], fov[1]);

            var fov = view.aladin.webglAPI.getFieldOfView();
            view.pinchZoomParameters.initialFov = fov;
            view.pinchZoomParameters.initialDistance = Math.sqrt(
              Math.pow(e.originalEvent.targetTouches[0].clientX - e.originalEvent.targetTouches[1].clientX, 2) +
                Math.pow(e.originalEvent.targetTouches[0].clientY - e.originalEvent.targetTouches[1].clientY, 2)
            );
            view.fingersRotationParameters.initialViewAngleFromCenter = view.aladin.webglAPI.getRotationAroundCenter();
            view.fingersRotationParameters.initialFingerAngle =
              (Math.atan2(
                e.originalEvent.targetTouches[1].clientY - e.originalEvent.targetTouches[0].clientY,
                e.originalEvent.targetTouches[1].clientX - e.originalEvent.targetTouches[0].clientX
              ) *
                180.0) /
              Math.PI;
            return;
          }

          var xymouse = view.imageCanvas.relMouseCoords(e);

          if (e.originalEvent && e.originalEvent.targetTouches) {
            view.dragx = e.originalEvent.targetTouches[0].clientX;
            view.dragy = e.originalEvent.targetTouches[0].clientY;
          } else {
            /*
        view.dragx = e.clientX;
        view.dragy = e.clientY;
        */
            view.dragx = xymouse.x;
            view.dragy = xymouse.y;
          }

          view.dragging = true;

          if (view.mode == View.PAN) {
            view.setCursor("move");
          } else if (view.mode == View.SELECT) {
            view.selectStartCoo = {
              x: view.dragx,
              y: view.dragy,
            };
          }

 2        view.aladin.webglAPI.pressLeftMouseButton(view.dragx, view.dragy);
          return false; // to disable text selection
        });
        $(view.catalogCanvas).bind("mouseup", function (e) {
          if (view.rightClick) {
            view.rightClick = false;
            view.rightclickx = null;
            view.rightclicky = null;
            return;
          }
        });
        $(view.catalogCanvas).bind("click mouseout touchend", function (e) {
          // reacting on 'click' rather on 'mouseup' is more reliable when panning the view
          if (e.type === "touchend" && view.pinchZoomParameters.isPinching) {
            view.pinchZoomParameters.isPinching = false;
            view.pinchZoomParameters.initialFov = view.pinchZoomParameters.initialDistance = undefined;
            return;
          }

          if (e.type === "touchend" && view.fingersRotationParameters.rotationInitiated) {
            view.fingersRotationParameters.initialViewAngleFromCenter = undefined;
            view.fingersRotationParameters.initialFingerAngle = undefined;
            view.fingersRotationParameters.rotationInitiated = false;
            return;
          }

          var wasDragging = view.realDragging === true;
          var selectionHasEnded = view.mode === View.SELECT && view.dragging;

          if (view.dragging) {
            // if we were dragging, reset to default cursor
            view.setCursor("default");
            view.dragging = false;

            if (wasDragging) {
              view.realDragging = false; // call positionChanged one last time after dragging, with dragging: false

              var posChangedFn = view.aladin.callbacksByEventName["positionChanged"];

              if (typeof posChangedFn === "function") {
                var pos = view.aladin.pix2world(view.width / 2, view.height / 2);

                if (pos !== undefined) {
                  posChangedFn({
                    ra: pos[0],
                    dec: pos[1],
                    dragging: false,
                  });
                }
              }
            }
          } // end of "if (view.dragging) ... "

          if (selectionHasEnded) {
            view.aladin.fire(
              "selectend",
              view.getObjectsInBBox(
                view.selectStartCoo.x,
                view.selectStartCoo.y,
                view.dragx - view.selectStartCoo.x,
                view.dragy - view.selectStartCoo.y
              )
            );
            view.requestRedraw();
            return;
          }

          view.mustClearCatalog = true;
          view.dragx = view.dragy = null;
          var xymouse = view.imageCanvas.relMouseCoords(e);

          if (e.type === "mouseout" || e.type === "touchend") {
            //view.requestRedraw();
            view.updateLocation(xymouse.x, xymouse.y, true);

            if (e.type === "mouseout") {
              if (view.mode === View.TOOL_SIMBAD_POINTER) {
                view.setMode(View.PAN);
              }

              return;
            }
          }

          if (view.mode == View.TOOL_SIMBAD_POINTER) {
            var radec = view.aladin.pix2world(xymouse.x, xymouse.y); // Convert from view to ICRSJ2000

            radec = view.aladin.webglAPI.viewToICRSJ2000CooSys(radec[0], radec[1]);
            view.setMode(View.PAN);
            view.setCursor("wait");

            if (radec) {
              SimbadPointer.query(radec[0], radec[1], Math.min(1, (15 * view.fov) / view.largestDim), view.aladin);
            } else {
              console.log("Cannot unproject at the location you clicked on");
            }

            return; // when in TOOL_SIMBAD_POINTER mode, we do not call the listeners
          } // popup to show ?

          var objs = view.closestObjects(xymouse.x, xymouse.y, 5);

          if (!wasDragging && objs) {
            var o = objs[0]; // footprint selection code adapted from Fabrizio Giordano dev. from Serco for ESA/ESDC

            if (o instanceof Footprint || o instanceof Circle) {
              o.dispatchClickEvent();
            } // display marker
            else if (o.marker) {
              // could be factorized in Source.actionClicked
              view.popup.setTitle(o.popupTitle);
              view.popup.setText(o.popupDesc);
              view.popup.setSource(o);
              view.popup.show();
            } // show measurements
            else {
              if (view.lastClickedObject) {
                view.lastClickedObject.actionOtherObjectClicked && view.lastClickedObject.actionOtherObjectClicked();
              }

              o.actionClicked();
            }

            view.lastClickedObject = o;
            var objClickedFunction = view.aladin.callbacksByEventName["objectClicked"];
            typeof objClickedFunction === "function" && objClickedFunction(o);
          } else {
            if (view.lastClickedObject && !wasDragging) {
              view.aladin.measurementTable.hide();
              view.popup.hide();

              if (view.lastClickedObject instanceof Footprint) {
                //view.lastClickedObject.deselect();
              } else {
                view.lastClickedObject.actionOtherObjectClicked();
              }

              view.lastClickedObject = null;
              var objClickedFunction = view.aladin.callbacksByEventName["objectClicked"];
              typeof objClickedFunction === "function" && objClickedFunction(null);
            }
          } // call listener of 'click' event

          var onClickFunction = view.aladin.callbacksByEventName["click"];

          if (typeof onClickFunction === "function") {
            var pos = view.aladin.pix2world(xymouse.x, xymouse.y);

            if (pos !== undefined) {
              onClickFunction({
                ra: pos[0],
                dec: pos[1],
                x: xymouse.x,
                y: xymouse.y,
                isDragging: wasDragging,
              });
            }
          } // TODO : remplacer par mecanisme de listeners
          // on avertit les catalogues progressifs

          view.refreshProgressiveCats(); //view.requestRedraw();

          view.aladin.webglAPI.releaseLeftButtonMouse();
        });
        var lastHoveredObject; // save last object hovered by mouse

        var lastMouseMovePos = null;
        $(view.catalogCanvas).bind("mousemove touchmove", function (e) {
          e.preventDefault();
          var xymouse = view.imageCanvas.relMouseCoords(e);

          if (view.rightClick && view.selectedSurveyLayer) {
            var selectedSurvey = view.imageSurveys.get(view.selectedSurveyLayer);

            if (!selectedSurvey.colored) {
              // we try to match DS9 contrast adjustment behaviour with right click
              var cs = {
                x: view.catalogCanvas.clientWidth * 0.5,
                y: view.catalogCanvas.clientHeight * 0.5,
              };
              var cx = (xymouse.x - cs.x) / view.catalogCanvas.clientWidth;
              var cy = -(xymouse.y - cs.y) / view.catalogCanvas.clientHeight;
              var offset = (cutMaxInit - cutMinInit) * cx;
              var lr = offset + (1.0 - 2.0 * cy) * cutMinInit;
              var rr = offset + (1.0 + 2.0 * cy) * cutMaxInit;

              if (lr <= rr) {
                selectedSurvey.setCuts([lr, rr]);
              }

              return;
            }
          }

          if (
            e.type === "touchmove" &&
            view.pinchZoomParameters.isPinching &&
            e.originalEvent &&
            e.originalEvent.touches &&
            e.originalEvent.touches.length == 2
          ) {
            // rotation
            var currentFingerAngle =
              (Math.atan2(
                e.originalEvent.targetTouches[1].clientY - e.originalEvent.targetTouches[0].clientY,
                e.originalEvent.targetTouches[1].clientX - e.originalEvent.targetTouches[0].clientX
              ) *
                180.0) /
              Math.PI;
            var fingerAngleDiff = view.fingersRotationParameters.initialFingerAngle - currentFingerAngle; // rotation is initiated when angle is equal or greater than 7 degrees

            if (!view.fingersRotationParameters.rotationInitiated && Math.abs(fingerAngleDiff) >= 7) {
              view.fingersRotationParameters.rotationInitiated = true;
              view.fingersRotationParameters.initialFingerAngle = currentFingerAngle;
              fingerAngleDiff = 0;
            }

            if (view.fingersRotationParameters.rotationInitiated) {
              view.aladin.webglAPI.setRotationAroundCenter(fingerAngleDiff + view.fingersRotationParameters.initialViewAngleFromCenter);
            } // zoom

            var dist = Math.sqrt(
              Math.pow(e.originalEvent.touches[0].clientX - e.originalEvent.touches[1].clientX, 2) +
                Math.pow(e.originalEvent.touches[0].clientY - e.originalEvent.touches[1].clientY, 2)
            );
            var fov = Math.min(
              Math.max((view.pinchZoomParameters.initialFov * view.pinchZoomParameters.initialDistance) / dist, 0.00002777777),
              360.0
            );
            view.setZoom(fov);
            return;
          }

          if (!view.dragging || hasTouchEvents) {
            // update location box
            view.updateLocation(xymouse.x, xymouse.y, false); // call listener of 'mouseMove' event

            var onMouseMoveFunction = view.aladin.callbacksByEventName["mouseMove"];

            if (typeof onMouseMoveFunction === "function") {
              var pos = view.aladin.pix2world(xymouse.x, xymouse.y);

              if (pos !== undefined) {
                onMouseMoveFunction({
                  ra: pos[0],
                  dec: pos[1],
                  x: xymouse.x,
                  y: xymouse.y,
                });
              } // send null ra and dec when we go out of the "sky"
              else if (lastMouseMovePos != null) {
                onMouseMoveFunction({
                  ra: null,
                  dec: null,
                  x: xymouse.x,
                  y: xymouse.y,
                });
              }

              lastMouseMovePos = pos;
            }

            if (!view.dragging && !view.mode == View.SELECT) {
              // objects under the mouse ?
              var closest = view.closestObjects(xymouse.x, xymouse.y, 5);

              if (closest) {
                view.setCursor("pointer");
                var objHoveredFunction = view.aladin.callbacksByEventName["objectHovered"];

                if (typeof objHoveredFunction === "function" && closest[0] != lastHoveredObject) {
                  var ret = objHoveredFunction(closest[0]);
                }

                lastHoveredObject = closest[0];
              } else {
                view.setCursor("default");
                var objHoveredFunction = view.aladin.callbacksByEventName["objectHovered"];

                if (typeof objHoveredFunction === "function" && lastHoveredObject) {
                  lastHoveredObject = null; // call callback function to notify we left the hovered object

                  var ret = objHoveredFunction(null);
                }
              }
            }

            if (!hasTouchEvents) {
              return;
            }
          }

          if (!view.dragging) {
            return;
          } //var xoffset, yoffset;

          var s1, s2;

          if (e.originalEvent && e.originalEvent.targetTouches) {
            /*xoffset = e.originalEvent.targetTouches[0].clientX-view.dragx;
        yoffset = e.originalEvent.targetTouches[0].clientY-view.dragy;
        var xy1 = AladinUtils.viewToXy(e.originalEvent.targetTouches[0].clientX, e.originalEvent.targetTouches[0].clientY, view.width, view.height, view.largestDim, view.zoomFactor);
        var xy2 = AladinUtils.viewToXy(view.dragx, view.dragy, view.width, view.height, view.largestDim, view.zoomFactor);
         pos1 = view.projection.unproject(xy1.x, xy1.y);
        pos2 = view.projection.unproject(xy2.x, xy2.y);*/
            s1 = {
              x: view.dragx,
              y: view.dragy,
            };
            s2 = {
              x: e.originalEvent.targetTouches[0].clientX,
              y: e.originalEvent.targetTouches[0].clientY,
            };
          } else {
            /*
        xoffset = e.clientX-view.dragx;
        yoffset = e.clientY-view.dragy;
         xoffset = xymouse.x-view.dragx;
        yoffset = xymouse.y-view.dragy;
        var xy1 = AladinUtils.viewToXy(xymouse.x, xymouse.y, view.width, view.height, view.largestDim, view.zoomFactor);
        var xy2 = AladinUtils.viewToXy(view.dragx, view.dragy, view.width, view.height, view.largestDim, view.zoomFactor);
        */
            //pos1 = view.projection.unproject(xy1.x, xy1.y);
            //pos2 = view.projection.unproject(xy2.x, xy2.y);

            /*pos1 = webglAPI.screenToWorld(view.dragx, view.dragy);
        pos2 = webglAPI.screenToWorld(xymouse.x, xymouse.y);
         if (pos2 == undefined)  {
            return;
        }*/
            s1 = {
              x: view.dragx,
              y: view.dragy,
            };
            s2 = {
              x: xymouse.x,
              y: xymouse.y,
            };
          } // TODO : faut il faire ce test ??
          //            var distSquared = xoffset*xoffset+yoffset*yoffset;
          //            if (distSquared<3) {
          //                return;
          //            }

          if (e.originalEvent && e.originalEvent.targetTouches) {
            view.dragx = e.originalEvent.targetTouches[0].clientX;
            view.dragy = e.originalEvent.targetTouches[0].clientY;
          } else {
            view.dragx = xymouse.x;
            view.dragy = xymouse.y;
            /*
        view.dragx = e.clientX;
        view.dragy = e.clientY;
        */
          }

          if (view.mode == View.SELECT) {
            view.requestRedraw();
            return;
          }

          view.realDragging = true; //webglAPI.goFromTo(pos1[0], pos1[1], pos2[0], pos2[1]);

          view.aladin.webglAPI.goFromTo(s1.x, s1.y, s2.x, s2.y); //webglAPI.setCenter(pos2[0], pos2[1]);

          var _view$aladin$webglAPI = view.aladin.webglAPI.getCenter(),
            _view$aladin$webglAPI2 = _slicedToArray(_view$aladin$webglAPI, 2),
            ra = _view$aladin$webglAPI2[0],
            dec = _view$aladin$webglAPI2[1];

          view.viewCenter.lon = ra;
          view.viewCenter.lat = dec;

          if (view.viewCenter.lon < 0.0) {
            view.viewCenter.lon += 360.0;
          }
        }); //// endof mousemove ////
        // disable text selection on IE

        $(view.aladinDiv).onselectstart = function () {
          return false;
        };

        $(view.catalogCanvas).on("wheel", function (event) {
          event.preventDefault();
          event.stopPropagation();

          if (view.rightClick) {
            return;
          } //var xymouse = view.imageCanvas.relMouseCoords(event);

          /*if(view.aladin.webglAPI.posOnUi()) {
          return;
      }*/
          //var xymouse = view.imageCanvas.relMouseCoords(event);
          //var level = view.zoomLevel;

          var delta = event.deltaY; // this seems to happen in context of Jupyter notebook --> we have to invert the direction of scroll
          // hope this won't trigger some side effects ...

          if (event.hasOwnProperty("originalEvent")) {
            delta = -event.originalEvent.deltaY;
          }
          /*if (delta>0) {
          level += 1;
          //zoom
      }
      else {
          level -= 1;
          //unzoom
      }*/
          // The value of the field of view is determined
          // inside the backend

          if (delta > 0.0) {
            view.increaseZoom();
          } else {
            view.decreaseZoom();
          }

          if (!view.debounceProgCatOnZoom) {
            var self = view;
            view.debounceProgCatOnZoom = Utils.debounce(function () {
              self.refreshProgressiveCats();
              self.drawAllOverlays();
            }, 300);
          }

          view.debounceProgCatOnZoom(); //view.setZoomLevel(level);
          //view.refreshProgressiveCats();

          return false;
        });
      };

      var init = function init(view) {
        var stats = new Stats();
        stats.domElement.style.top = "50px";

        if ($("#aladin-statsDiv").length > 0) {
          $("#aladin-statsDiv")[0].appendChild(stats.domElement);
        }

        view.stats = stats;
        createListeners(view);
        view.executeCallbacksThrottled = Utils.throttle(function () {
          var pos = view.aladin.pix2world(view.width / 2, view.height / 2);
          var fov = view.fov;

          if (pos === undefined || fov === undefined) {
            return;
          }

          var ra = pos[0];
          var dec = pos[1]; // trigger callback only if position has changed !

          if (ra !== this.ra || dec !== this.dec) {
            var posChangedFn = view.aladin.callbacksByEventName["positionChanged"];
            typeof posChangedFn === "function" &&
              posChangedFn({
                ra: ra,
                dec: dec,
                dragging: true,
              }); // finally, save ra and dec value

            this.ra = ra;
            this.dec = dec;
          } // trigger callback only if FoV (zoom) has changed !

          if (fov !== this.old_fov) {
            var fovChangedFn = view.aladin.callbacksByEventName["zoomChanged"];
            typeof fovChangedFn === "function" && fovChangedFn(fov); // finally, save fov value

            this.old_fov = fov;
          }
        }, View.CALLBACKS_THROTTLE_TIME_MS);
        view.displayHpxGrid = false;
        view.displaySurvey = true;
        view.displayCatalog = false;
        view.displayReticle = true; // initial draw
        //view.fov = computeFov(view);
        //updateFovDiv(view);
        //view.redraw();
      };

      View.prototype.updateLocation = function (mouseX, mouseY, isViewCenterPosition) {
        if (!this.projection) {
          return;
        }

        if (isViewCenterPosition) {
          //const [ra, dec] = this.aladin.webglAPI.ICRSJ2000ToViewCooSys(this.viewCenter.lon, this.viewCenter.lat);
          this.location.update(this.viewCenter.lon, this.viewCenter.lat, this.cooFrame, true);
        } else {
          var radec = this.aladin.webglAPI.screenToWorld(mouseX, mouseY); // This is given in the frame of the view

          if (radec) {
            if (radec[0] < 0) {
              radec = [radec[0] + 360.0, radec[1]];
            }

            this.location.update(radec[0], radec[1], this.cooFrame, false);
          }
        }
      };

      View.prototype.requestRedrawAtDate = function (date) {
        this.dateRequestDraw = date;
      };
      /**
       * Return the color of the lowest intensity pixel
       * in teh current color map of the current background image HiPS
       */

      View.prototype.getBackgroundColor = function () {
        var white = "rgb(255, 255, 255)";
        var black = "rgb(0, 0, 0)";

        if (!this.imageSurvey) {
          return black;
        }

        var cm = this.imageSurvey.getColorMap();

        if (!cm) {
          return black;
        }

        if (cm.mapName == "native" || cm.mapName == "grayscale") {
          return cm.reversed ? white : black;
        }

        var idx = cm.reversed ? 255 : 0;
        var r = ColorMap.MAPS[cm.mapName].r[idx];
        var g = ColorMap.MAPS[cm.mapName].g[idx];
        var b = ColorMap.MAPS[cm.mapName].b[idx];
        return "rgb(" + r + "," + g + "," + b + ")";
      };

      View.prototype.getViewParams = function () {
        var resolution = this.width > this.height ? this.fov / this.width : this.fov / this.height;
        return {
          fov: [this.width * resolution, this.height * resolution],
          width: this.width,
          height: this.height,
        };
      };
      /**
       * redraw the whole view
       */

      View.prototype.redraw = function () {
        // calc elapsed time since last loop
        // Put your drawing code here
        try {
          //var dt = now_update - this.prev;
          this.aladin.webglAPI.update(Date.now() - this.then);
        } catch (e) {
          console.error(e);
        } // check whether a catalog has been parsed and
        // is ready to be plot

        var catReady = this.aladin.webglAPI.isCatalogLoaded();

        if (catReady) {
          var callbackFn = this.aladin.callbacksByEventName["catalogReady"];
          typeof callbackFn === "function" && callbackFn();
        }

        try {
          this.aladin.webglAPI.render(this.needRedraw);
        } catch (e) {
          console.error("Error: ", e);
        } ////// 2. Draw catalogues////////

        var isViewRendering = this.aladin.webglAPI.isRendering();

        if (isViewRendering || this.needRedraw) {
          this.drawAllOverlays();
        }

        this.needRedraw = false; // objects lookup

        if (!this.dragging) {
          this.updateObjectsLookup();
        }

        this.then = Date.now(); // request another frame

        requestAnimFrame(this.redraw.bind(this));
      };

      View.prototype.drawAllOverlays = function () {
        var catalogCtx = this.catalogCtx;
        var catalogCanvasCleared = false;

        if (this.mustClearCatalog) {
          catalogCtx.clearRect(0, 0, this.width, this.height);
          catalogCanvasCleared = true;
          this.mustClearCatalog = false;
        }

        if (this.catalogs && this.catalogs.length > 0 && this.displayCatalog && (!this.dragging || View.DRAW_SOURCES_WHILE_DRAGGING)) {
          // TODO : do not clear every time
          //// clear canvas ////
          if (!catalogCanvasCleared) {
            catalogCtx.clearRect(0, 0, this.width, this.height);
            catalogCanvasCleared = true;
          }

          for (var i = 0; i < this.catalogs.length; i++) {
            var cat = this.catalogs[i];
            cat.draw(catalogCtx, this.projection, this.cooFrame, this.width, this.height, this.largestDim, this.zoomFactor);
          }
        } // draw popup catalog

        if (this.catalogForPopup.isShowing && this.catalogForPopup.sources.length > 0) {
          if (!catalogCanvasCleared) {
            catalogCtx.clearRect(0, 0, this.width, this.height);
            catalogCanvasCleared = true;
          }

          this.catalogForPopup.draw(catalogCtx, this.projection, this.cooFrame, this.width, this.height, this.largestDim, this.zoomFactor);
        } ////// 3. Draw overlays////////

        var overlayCtx = this.catalogCtx;

        if (this.overlays && this.overlays.length > 0 && (!this.dragging || View.DRAW_SOURCES_WHILE_DRAGGING)) {
          if (!catalogCanvasCleared) {
            catalogCtx.clearRect(0, 0, this.width, this.height);
            catalogCanvasCleared = true;
          }

          for (var i = 0; i < this.overlays.length; i++) {
            this.overlays[i].draw(overlayCtx, this.projection, this.cooFrame, this.width, this.height, this.largestDim, this.zoomFactor);
          }
        } // Redraw HEALPix grid

        var healpixGridCtx = catalogCtx;

        if (this.displayHpxGrid) {
          if (!catalogCanvasCleared) {
            catalogCtx.clearRect(0, 0, this.width, this.height);
            catalogCanvasCleared = true;
          }

          var cornersXYViewMapAllsky = this.getVisibleCells(3);
          var cornersXYViewMapHighres = null;

          if (this.curNorder >= 3) {
            if (this.curNorder == 3) {
              cornersXYViewMapHighres = cornersXYViewMapAllsky;
            } else {
              cornersXYViewMapHighres = this.getVisibleCells(this.curNorder);
            }
          }

          if (cornersXYViewMapHighres && this.curNorder > 3) {
            this.healpixGrid.redraw(healpixGridCtx, cornersXYViewMapHighres, this.fov, this.curNorder);
          } else {
            this.healpixGrid.redraw(healpixGridCtx, cornersXYViewMapAllsky, this.fov, 3);
          }
        } // draw MOCs

        var mocCtx = catalogCtx;

        if (this.mocs && this.mocs.length > 0 && (!this.dragging || View.DRAW_MOCS_WHILE_DRAGGING)) {
          if (!catalogCanvasCleared) {
            catalogCtx.clearRect(0, 0, this.width, this.height);
            catalogCanvasCleared = true;
          }

          for (var i = 0; i < this.mocs.length; i++) {
            this.mocs[i].draw(mocCtx, this.projection, this.cooFrame, this.width, this.height, this.largestDim, this.zoomFactor, this.fov);
          }
        } ////// 4. Draw reticle ///////
        // TODO: reticle should be placed in a static DIV, no need to waste a canvas

        var reticleCtx = catalogCtx;

        if (this.mode == View.SELECT) {
          // VIEW mode, we do not want to display the reticle in this
          // but draw a selection box
          if (this.dragging) {
            if (!catalogCanvasCleared) {
              reticleCtx.clearRect(0, 0, this.width, this.height);
              catalogCanvasCleared = true;
            }

            reticleCtx.fillStyle = "rgba(100, 240, 110, 0.25)";
            var w = this.dragx - this.selectStartCoo.x;
            var h = this.dragy - this.selectStartCoo.y;
            reticleCtx.fillRect(this.selectStartCoo.x, this.selectStartCoo.y, w, h);
          }
        } else {
          // Normal modes
          if (this.displayReticle) {
            if (!catalogCanvasCleared) {
              catalogCtx.clearRect(0, 0, this.width, this.height);
              catalogCanvasCleared = true;
            }

            if (!this.reticleCache) {
              // build reticle image
              var c = document.createElement("canvas");
              var s = this.options.reticleSize;
              c.width = s;
              c.height = s;
              var ctx = c.getContext("2d");
              ctx.lineWidth = 2;
              ctx.strokeStyle = this.options.reticleColor;
              ctx.beginPath();
              ctx.moveTo(s / 2, s / 2 + (s / 2 - 1));
              ctx.lineTo(s / 2, s / 2 + 2);
              ctx.moveTo(s / 2, s / 2 - (s / 2 - 1));
              ctx.lineTo(s / 2, s / 2 - 2);
              ctx.moveTo(s / 2 + (s / 2 - 1), s / 2);
              ctx.lineTo(s / 2 + 2, s / 2);
              ctx.moveTo(s / 2 - (s / 2 - 1), s / 2);
              ctx.lineTo(s / 2 - 2, s / 2);
              ctx.stroke();
              this.reticleCache = c;
            }

            reticleCtx.drawImage(this.reticleCache, this.width / 2 - this.reticleCache.width / 2, this.height / 2 - this.reticleCache.height / 2);
          }
        } ////// 5. Draw all-sky ring /////

        if (this.projection.PROJECTION == ProjectionEnum.SIN && this.fov >= 60 && this.aladin.options["showAllskyRing"] === true) {
          if (!catalogCanvasCleared) {
            reticleCtx.clearRect(0, 0, this.width, this.height);
            catalogCanvasCleared = true;
          }

          reticleCtx.strokeStyle = this.aladin.options["allskyRingColor"];
          var ringWidth = this.aladin.options["allskyRingWidth"];
          reticleCtx.lineWidth = ringWidth;
          reticleCtx.beginPath();
          var maxCxCy = this.cx > this.cy ? this.cx : this.cy;
          reticleCtx.arc(this.cx, this.cy, (maxCxCy - ringWidth / 2.0 + 1) / this.zoomFactor, 0, 2 * Math.PI, true);
          reticleCtx.stroke();
        }
      };

      View.prototype.refreshProgressiveCats = function () {
        if (!this.catalogs) {
          return;
        }

        for (var i = 0; i < this.catalogs.length; i++) {
          if (this.catalogs[i].type == "progressivecat") {
            this.catalogs[i].loadNeededTiles();
          }
        }
      };

      View.prototype.getVisiblePixList = function (norder) {
        var pixList = [];
        var centerWorldPosition = this.aladin.webglAPI.screenToWorld(this.cx, this.cy);

        var _this$aladin$webglAPI = this.aladin.webglAPI.viewToICRSJ2000CooSys(centerWorldPosition[0], centerWorldPosition[1]),
          _this$aladin$webglAPI2 = _slicedToArray(_this$aladin$webglAPI, 2),
          lon = _this$aladin$webglAPI2[0],
          lat = _this$aladin$webglAPI2[1];

        var radius = this.fov * 0.5 * this.ratio;
        this.aladin.webglAPI.queryDisc(norder, lon, lat, radius).forEach(function (x) {
          return pixList.push(Number(x));
        });
        return pixList;
      };

      View.prototype.setAngleRotation = function (theta) {}; // TODO: optimize this method !!

      View.prototype.getVisibleCells = function (norder) {
        var _this = this;

        var cells = []; // array to be returned

        var cornersXY = [];
        var nside = Math.pow(2, norder); // TODO : to be modified

        var npix = 12 * nside * nside;
        var ipixCenter = null; // build list of pixels

        var pixList = this.getVisiblePixList(norder);
        var ipix;
        var lon, lat;
        var corners;

        for (var ipixIdx = 0, len = pixList.length; ipixIdx < len; ipixIdx++) {
          ipix = pixList[ipixIdx];

          if (ipix == ipixCenter && ipixIdx > 0) {
            continue;
          }

          var cornersXYView = []; //corners = HealpixCache.corners_nest(ipix, nside);

          corners = this.aladin.webglAPI.hpxNestedVertices(Math.log2(nside), ipix);

          for (var k = 0; k < 4; k++) {
            var _lon = corners[k * 2];
            var _lat = corners[k * 2 + 1];
            cornersXY[k] = this.aladin.webglAPI.worldToScreen(_lon, _lat);
          }

          if (cornersXY[0] == null || cornersXY[1] == null || cornersXY[2] == null || cornersXY[3] == null) {
            continue;
          }

          for (var k = 0; k < 4; k++) {
            //cornersXYView[k] = AladinUtils.xyToView(cornersXY[k].X, cornersXY[k].Y, this.width, this.height, this.largestDim, this.zoomFactor);
            cornersXYView[k] = {
              vx: cornersXY[k][0],
              vy: cornersXY[k][1],
            };
          } // detect pixels outside view. Could be improved !
          // we minimize here the number of cells returned

          if (cornersXYView[0].vx < 0 && cornersXYView[1].vx < 0 && cornersXYView[2].vx < 0 && cornersXYView[3].vx < 0) {
            continue;
          }

          if (cornersXYView[0].vy < 0 && cornersXYView[1].vy < 0 && cornersXYView[2].vy < 0 && cornersXYView[3].vy < 0) {
            continue;
          }

          if (
            cornersXYView[0].vx >= this.width &&
            cornersXYView[1].vx >= this.width &&
            cornersXYView[2].vx >= this.width &&
            cornersXYView[3].vx >= this.width
          ) {
            continue;
          }

          if (
            cornersXYView[0].vy >= this.height &&
            cornersXYView[1].vy >= this.height &&
            cornersXYView[2].vy >= this.height &&
            cornersXYView[3].vy >= this.height
          ) {
            continue;
          } // check if pixel is visible
          //            if (this.fov<160) { // don't bother checking if fov is large enough
          //                if ( ! AladinUtils.isHpxPixVisible(cornersXYView, this.width, this.height) ) {
          //                    continue;
          //                }
          //            }
          // check if we have a pixel at the edge of the view in allsky projections
          //if (this.projection.PROJECTION!=ProjectionEnum.SIN && this.projection.PROJECTION!=ProjectionEnum.TAN) {

          /*var xdiff = cornersXYView[0].vx-cornersXYView[2].vx;
      var ydiff = cornersXYView[0].vy-cornersXYView[2].vy;
      var distDiag = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
      if (distDiag>this.largestDim/5) {
          continue;
      }
      xdiff = cornersXYView[1].vx-cornersXYView[3].vx;
      ydiff = cornersXYView[1].vy-cornersXYView[3].vy;
      distDiag = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
      if (distDiag>this.largestDim/5) {
          continue;
      }*/
          // New faster approach: when a vertex from a cell gets to the other side of the projection
          // its vertices order change from counter-clockwise to clockwise!
          // So if the vertices describing a cell are given in clockwise order
          // we know it crosses the projection, so we do not plot them!

          if (
            !AladinUtils.counterClockwiseTriangle(
              cornersXYView[0].vx,
              cornersXYView[0].vy,
              cornersXYView[1].vx,
              cornersXYView[1].vy,
              cornersXYView[2].vx,
              cornersXYView[2].vy
            ) ||
            !AladinUtils.counterClockwiseTriangle(
              cornersXYView[0].vx,
              cornersXYView[0].vy,
              cornersXYView[2].vx,
              cornersXYView[2].vy,
              cornersXYView[3].vx,
              cornersXYView[3].vy
            )
          ) {
            continue;
          } //}

          if (this.projection.PROJECTION == ProjectionEnum.HPX) {
            var triIdxInCollignonZone = function triIdxInCollignonZone(p) {
              var x = (p.vx / _this.catalogCanvas.clientWidth - 0.5) * _this.zoomFactor;
              var y = (p.vy / _this.catalogCanvas.clientHeight - 0.5) * _this.zoomFactor;
              var xZone = Math.floor((x + 0.5) * 4);
              return xZone + 4 * (y > 0.0);
            };

            var isInCollignon = function isInCollignon(p) {
              var y = (p.vy / _this.catalogCanvas.clientHeight - 0.5) * _this.zoomFactor;
              return y < -0.25 || y > 0.25;
            };

            if (
              isInCollignon(cornersXYView[0]) &&
              isInCollignon(cornersXYView[1]) &&
              isInCollignon(cornersXYView[2]) &&
              isInCollignon(cornersXYView[3])
            ) {
              var allVerticesInSameCollignonRegion =
                triIdxInCollignonZone(cornersXYView[0]) == triIdxInCollignonZone(cornersXYView[1]) &&
                triIdxInCollignonZone(cornersXYView[0]) == triIdxInCollignonZone(cornersXYView[2]) &&
                triIdxInCollignonZone(cornersXYView[0]) == triIdxInCollignonZone(cornersXYView[3]);

              if (!allVerticesInSameCollignonRegion) {
                continue;
              }
            }
          }

          cornersXYView.ipix = ipix;
          cells.push(cornersXYView);
        }

        return cells;
      };
      /*View.prototype.computeZoomFactor = function(level) {
      if (level>0) {
          return AladinUtils.getZoomFactorForAngle(180.0/Math.pow(1.35, level), this.projectionMethod);
      }
      else {
          return 1 + 0.1*level;
      }
  };*/

      /*View.prototype.computeZoomLevelFromFOV = function() {
      if (level>0) {
          return AladinUtils.getZoomFactorForAngle(180/Math.pow(1.15, level), this.projectionMethod);
      }
      else {
          return 1 + 0.1*level;
      }
  };*/
      // Called for touchmove events
      // initialAccDelta must be consistent with fovDegrees here

      View.prototype.setZoom = function (fovDegrees) {
        var si = 500000.0;
        var alpha = 40.0;
        this.pinchZoomParameters.initialAccDelta = Math.pow(si / fovDegrees, 1.0 / alpha);
        /*if (fovDegrees<0) {
        return;
    }*/
        //const si = 500000.0;
        //const alpha = 40.0;
        // Erase the field of view state of the backend by

        this.aladin.webglAPI.setFieldOfView(fovDegrees); //var zoomLevel = Math.log(180/fovDegrees)/Math.log(1.15);
        //this.setZoomLevel(zoomLevel);

        this.updateZoomState();
        this.updateFovDiv();
      };

      View.prototype.increaseZoom = function () {
        var si = 500000.0;
        var alpha = 40.0;
        var amount = 0.005;
        this.pinchZoomParameters.initialAccDelta += amount;

        if (this.pinchZoomParameters.initialAccDelta <= 0.0) {
          this.pinchZoomParameters.initialAccDelta = 1e-3;
        }

        var new_fov = si / Math.pow(this.pinchZoomParameters.initialAccDelta, alpha);

        if (new_fov > 360.0) {
          new_fov = 360.0; //this.pinchZoomParameters.initialAccDelta = Math.pow(si / new_fov, 1.0/alpha);
        }

        if (new_fov < 0.00002777777) {
          new_fov = 0.00002777777; //this.pinchZoomParameters.initialAccDelta = Math.pow(si / new_fov, 1.0/alpha);
        }

        this.setZoom(new_fov);
      };

      View.prototype.decreaseZoom = function () {
        var si = 500000.0;
        var alpha = 40.0;
        var amount = 0.005;
        this.pinchZoomParameters.initialAccDelta -= amount;

        if (this.pinchZoomParameters.initialAccDelta <= 0.0) {
          this.pinchZoomParameters.initialAccDelta = 1e-3;
        }

        var new_fov = si / Math.pow(this.pinchZoomParameters.initialAccDelta, alpha);

        if (new_fov > 360.0) {
          new_fov = 360.0; //this.pinchZoomParameters.initialAccDelta = Math.pow(si / new_fov, 1.0/alpha);
        }

        if (new_fov < 0.00002777777) {
          new_fov = 0.00002777777; //this.pinchZoomParameters.initialAccDelta = Math.pow(si / new_fov, 1.0/alpha);
        }

        this.setZoom(new_fov);
      };

      View.prototype.setGridConfig = function (gridCfg) {
        this.aladin.webglAPI.setGridConfig(gridCfg); // send events

        if (gridCfg) {
          if (gridCfg.hasOwnProperty("enabled")) {
            this.showCooGrid = true;

            if (gridCfg.enabled === true) {
              ALEvent.COO_GRID_ENABLED.dispatchedTo(this.aladinDiv);
            } else {
              ALEvent.COO_GRID_DISABLED.dispatchedTo(this.aladinDiv);
            }
          }

          if (gridCfg.color) {
            ALEvent.COO_GRID_UPDATED.dispatchedTo(this.aladinDiv, {
              color: gridCfg.color,
            });
          }
        }

        this.requestRedraw();
      };

      View.prototype.updateZoomState = function () {
        this.zoomFactor = this.aladin.webglAPI.getClipZoomFactor();
        this.fov = this.aladin.webglAPI.getFieldOfView();
        this.computeNorder();
      };
      /**
       * compute and set the norder corresponding to the current view resolution
       */

      View.prototype.computeNorder = function () {
        /*var resolution = this.fov / this.largestDim; // in degree/pixel
    var tileSize = 512; // TODO : read info from HpxImageSurvey.tileSize
    const calculateNSide = (pixsize) => {
        const NS_MAX = 536870912;
        const ORDER_MAX = 29;
    
        // Available nsides ..always power of 2 ..
        const NSIDELIST = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048,
            4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288,
                                   1048576, 2097152, 4194304, 8388608, 16777216, 33554432,
                                   67108864, 134217728,  268435456, 536870912];
         let res = 0;
        const pixelArea = pixsize * pixsize;
        const degrad = 180. / Math.PI;
        const skyArea = 4. * Math.PI * degrad * degrad * 3600. * 3600.;
        const castToInt = function (x) {
            if (x > 0) {
                return Math.floor(x);
            }
            else {
                return Math.ceil(x);
            }
        };
        const npixels = castToInt(skyArea / pixelArea);
        const nsidesq = npixels / 12;
        const nside_req = Math.sqrt(nsidesq);
        var mindiff = NS_MAX;
        var indmin = 0;
        for (var i = 0; i < NSIDELIST.length; i++) {
            if (Math.abs(nside_req - NSIDELIST[i]) <= mindiff) {
                mindiff = Math.abs(nside_req - NSIDELIST[i]);
                res = NSIDELIST[i];
                indmin = i;
            }
            if ((nside_req > res) && (nside_req < NS_MAX))
                res = NSIDELIST[indmin + 1];
            if (nside_req > NS_MAX) {
                console.log("nside cannot be bigger than " + NS_MAX);
                return NS_MAX;
            }
             }
        return res;
    };*/
        //var nside = calculateNSide(3600*tileSize*resolution); // 512 = size of a "tile" image
        //var norder = Math.log(nside)/Math.log(2);
        //norder = Math.max(norder, 1);
        var norder = this.aladin.webglAPI.getNOrder();
        this.realNorder = norder; // here, we force norder to 3 (otherwise, the display is "blurry" for too long when zooming in)

        if (this.fov <= 50 && norder <= 2) {
          norder = 3;
        } // that happens if we do not wish to display tiles coming from Allsky.[jpg|png]

        if (this.imageSurvey && norder <= 2 && this.imageSurvey.minOrder > 2) {
          norder = this.imageSurvey.minOrder;
        }

        if (this.imageSurvey && norder > this.imageSurvey.maxOrder) {
          norder = this.imageSurvey.maxOrder;
        } // should never happen, as calculateNSide will return something <=HealpixIndex.ORDER_MAX

        if (norder > 29) {
          norder = 29;
        }

        this.curNorder = norder;
      };

      View.prototype.untaintCanvases = function () {
        this.createCanvases();
        createListeners(this);
        this.fixLayoutDimensions();
      };

      View.prototype.setBaseImageLayer = function (baseSurveyPromise) {
        this.setOverlayImageSurvey(baseSurveyPromise, "base");
      };

      View.prototype.setOverlayImageSurvey = function (survey) {
        var layer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "overlay";
        var surveyIdx = this.imageSurveysIdx.get(layer) || 0;
        var newSurveyIdx = surveyIdx + 1;
        this.imageSurveysIdx.set(layer, newSurveyIdx);
        survey.orderIdx = newSurveyIdx; // Check whether this layer already exist

        var idxOverlaySurveyFound = this.overlayLayers.findIndex(function (overlayLayer) {
          return overlayLayer == layer;
        });

        if (idxOverlaySurveyFound == -1) {
          if (layer === "base") {
            // insert at the beginning
            this.overlayLayers.splice(0, 0, layer);
          } else {
            this.overlayLayers.push(layer);
          }
        } else {
          // find the survey by layer and erase it by the new value
          this.overlayLayers[idxOverlaySurveyFound] = layer;
        } /// async part

        if (this.options.log && survey.properties) {
          Logger.log("setImageLayer", survey.properties.url);
        }

        survey.added = true;
        survey.layer = layer;
        survey.existedBefore = false;
        var pastSurvey = this.imageSurveys.get(layer);

        if (pastSurvey && pastSurvey.ready && pastSurvey.added) {
          survey.existedBefore = true;
        }

        this.imageSurveys.set(layer, survey);

        if (survey.ready) {
          this.commitSurveysToBackend(survey, layer);
        }
      };

      View.prototype.buildSortedImageSurveys = function () {
        var _this2 = this;

        var sortedImageSurveys = [];
        this.overlayLayers.forEach(function (overlaidLayer) {
          sortedImageSurveys.push(_this2.imageSurveys.get(overlaidLayer));
        });
        return sortedImageSurveys;
      };

      View.prototype.updateImageLayerStack = function () {
        try {
          var surveys = this.buildSortedImageSurveys()
            .filter(function (s) {
              return s !== undefined && s.properties;
            })
            .map(function (s) {
              //let {backend, ...survey} = s;
              //return survey;
              return {
                layer: s.layer,
                properties: s.properties,
                meta: s.meta,
                // rust accepts it in upper case whereas the js API handles 'jpeg', 'png' or 'fits' in lower case
                imgFormat: s.options.imgFormat.toUpperCase(),
              };
            });
          console.log(surveys);
          this.aladin.webglAPI.setImageSurveys(surveys);
        } catch (e) {
          console.error(e);
        }
      };

      View.prototype.removeImageSurvey = function (layer) {
        this.imageSurveys["delete"](layer);
        var idxOverlaidSurveyFound = this.overlayLayers.findIndex(function (overlaidLayer) {
          return overlaidLayer == layer;
        });

        if (idxOverlaidSurveyFound == -1) {
          // layer not found
          return;
        } // Remove it from the layer stack

        this.overlayLayers.splice(idxOverlaidSurveyFound, 1); // Update the backend

        this.updateImageLayerStack();

        if (this.selectedSurveyLayer === layer) {
          this.selectedSurveyLayer = null;
        }

        ALEvent.HIPS_LAYER_REMOVED.dispatchedTo(this.aladinDiv, {
          layer: layer,
        });
      };

      View.prototype.commitSurveysToBackend = function (survey) {
        var layer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "base";

        //const layerAlreadyContained = this.imageSurveys.has(layer); true
        try {
          this.updateImageLayerStack();

          if (survey.existedBefore) {
            //if (this.selectedSurveyLayer && this.selectedSurveyLayer === layer) {
            //    this.selectedSurveyLayer = layer;
            //}
            ALEvent.HIPS_LAYER_CHANGED.dispatchedTo(this.aladinDiv, {
              survey: survey,
            });
          } else {
            survey.existedBefore = true;
            ALEvent.HIPS_LAYER_ADDED.dispatchedTo(this.aladinDiv, {
              survey: survey,
            });
          }
        } catch (e) {
          // En error occured while loading the HiPS
          // Remove it from the View
          // - First, from the image dict
          this.imageSurveys["delete"](layer); // Tell the survey object that it is not linked to the view anymore

          survey.added = false; // Finally delete the layer

          var idxOverlaidSurveyFound = this.overlayLayers.findIndex(function (overlaidLayer) {
            return overlaidLayer == layer;
          });

          if (idxOverlaidSurveyFound >= 0) {
            // Remove it from the layer stack
            this.overlayLayers.splice(idxOverlaidSurveyFound, 1);
          }

          throw "Error loading the HiPS " + survey + ":" + e;
        }
      };

      View.prototype.getImageSurvey = function () {
        var layer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "base";
        var survey = this.imageSurveys.get(layer);
        return survey;
      };

      View.prototype.getImageSurveyMeta = function () {
        var layer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "base";

        try {
          return this.aladin.webglAPI.getImageSurveyMeta(layer);
        } catch (e) {
          console.error(e);
        }
      };

      View.prototype.setImageSurveyMeta = function () {
        var layer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "base";
        var meta = arguments.length > 1 ? arguments[1] : undefined;

        try {
          this.aladin.webglAPI.setImageSurveyMeta(layer, meta);
        } catch (e) {
          console.error(e);
        }
      };
      /*View.prototype.setImageSurveysLayer = function(surveys, layer) {
      this.imageSurveys.set(layer, new Map());
       surveys.forEach(survey => {
          const url = survey.properties.url;
          survey.layer = layer;
          
          this.imageSurveys.get(layer).set(url, survey);
      });
       // Then we send the current surveys to the backend
      this.setHiPS();
  };*/

      /*View.prototype.removeImageSurveysLayer = function (layer) {
      this.imageSurveys.delete(layer);
       this.setHiPS();
  };*/

      /*View.prototype.moveImageSurveysLayerForward = function(layer) {
      this.aladin.webglAPI.moveImageSurveysLayerForward(layer);
  }*/

      View.prototype.requestRedraw = function () {
        this.needRedraw = true;
      };

      View.prototype.setProjection = function (projectionName) {
        switch (projectionName) {
          case "AIT":
            this.projection.setProjection(ProjectionEnum.AITOFF); //this.projectionMethod = ProjectionEnum.AITOFF;

            break;

          case "HPX":
            this.projection.setProjection(ProjectionEnum.HPX); //this.projectionMethod = ProjectionEnum.HPX;

            break;

          case "TAN":
            this.projection.setProjection(ProjectionEnum.TAN); //this.projectionMethod = ProjectionEnum.TAN;

            break;

          case "ARC":
            this.projection.setProjection(ProjectionEnum.ARC); //this.projectionMethod = ProjectionEnum.ARC;

            break;

          case "MER":
            this.projection.setProjection(ProjectionEnum.MERCATOR); //this.projectionMethod = ProjectionEnum.MERCATOR;

            break;

          case "MOL":
            this.projection.setProjection(ProjectionEnum.MOL); //this.projectionMethod = ProjectionEnum.MOL;

            break;

          case "SIN":
          default:
            this.projection.setProjection(ProjectionEnum.SIN);
          //this.projectionMethod = ProjectionEnum.SIN;
        } // Change the projection here

        this.aladin.webglAPI = this.aladin.webglAPI.setProjection(projectionName, this.width, this.height);
        this.requestRedraw();
      };

      View.prototype.changeFrame = function (cooFrame) {
        this.cooFrame = cooFrame; // Set the new frame to the backend

        if (this.cooFrame.system == CooFrameEnum.SYSTEMS.GAL) {
          this.aladin.webglAPI.setCooSystem(Aladin.wasmLibs.webgl.CooSystem.GAL);
        } else if (this.cooFrame.system == CooFrameEnum.SYSTEMS.J2000) {
          this.aladin.webglAPI.setCooSystem(Aladin.wasmLibs.webgl.CooSystem.ICRSJ2000);
        } // Get the new view center position (given in icrsj2000)

        var _this$aladin$webglAPI3 = this.aladin.webglAPI.getCenter(),
          _this$aladin$webglAPI4 = _slicedToArray(_this$aladin$webglAPI3, 2),
          ra = _this$aladin$webglAPI4[0],
          dec = _this$aladin$webglAPI4[1];

        this.viewCenter.lon = ra;
        this.viewCenter.lat = dec;

        if (this.viewCenter.lon < 0.0) {
          this.viewCenter.lon += 360.0;
        }

        this.location.update(this.viewCenter.lon, this.viewCenter.lat, this.cooFrame, true);
        this.requestRedraw();
      };

      View.prototype.showHealpixGrid = function (show) {
        this.displayHpxGrid = show;

        if (!this.displayHpxGrid) {
          this.mustClearCatalog = true;
        }

        this.requestRedraw();
      };

      View.prototype.showSurvey = function (show) {
        this.displaySurvey = show;
        this.requestRedraw();
      };

      View.prototype.showCatalog = function (show) {
        this.displayCatalog = show;

        if (!this.displayCatalog) {
          this.mustClearCatalog = true;
        }

        this.requestRedraw();
      };

      View.prototype.showReticle = function (show) {
        this.displayReticle = show;

        if (!this.displayReticle) {
          this.mustClearCatalog = true;
        }

        this.requestRedraw();
      };
      /**
       *
       * @API Point to a specific location in ICRSJ2000
       *
       * @param ra ra expressed in ICRS J2000 frame
       * @param dec dec expressed in ICRS J2000 frame
       * @param options
       *
       */

      View.prototype.pointTo = function (ra, dec, options) {
        options = options || {};
        ra = parseFloat(ra);
        dec = parseFloat(dec);

        if (isNaN(ra) || isNaN(dec)) {
          return;
        }

        this.viewCenter.lon = ra;
        this.viewCenter.lat = dec;

        if (this.viewCenter.lon < 0.0) {
          this.viewCenter.lon += 360.0;
        }

        this.location.update(this.viewCenter.lon, this.viewCenter.lat, this.cooFrame, true); // Put a javascript code here to do some animation
        //this.projection.setCenter(this.viewCenter.lon, this.viewCenter.lat);

        this.aladin.webglAPI.setCenter(this.viewCenter.lon, this.viewCenter.lat);
        this.requestRedraw();
        var self = this;
        setTimeout(function () {
          self.refreshProgressiveCats();
        }, 1000);
      };

      View.prototype.makeUniqLayerName = function (name) {
        if (!this.layerNameExists(name)) {
          return name;
        }

        for (var k = 1; ; ++k) {
          var newName = name + "_" + k;

          if (!this.layerNameExists(newName)) {
            return newName;
          }
        }
      };

      View.prototype.layerNameExists = function (name) {
        var c = this.allOverlayLayers;

        for (var k = 0; k < c.length; k++) {
          if (name == c[k].name) {
            return true;
          }
        }

        return false;
      };

      View.prototype.removeLayers = function () {
        this.catalogs = [];
        this.overlays = [];
        this.mocs = [];
        this.allOverlayLayers = [];
        this.requestRedraw();
      };

      View.prototype.removeLayer = function (layer) {
        var indexToDelete = this.allOverlayLayers.indexOf(layer);
        this.allOverlayLayers.splice(indexToDelete, 1);

        if (layer.type == "catalog" || layer.type == "progressivecat") {
          indexToDelete = this.catalogs.indexOf(layer);
          this.catalogs.splice(indexToDelete, 1);
        } else if (layer.type == "moc") {
          indexToDelete = this.mocs.indexOf(layer);
          this.mocs.splice(indexToDelete, 1);
        } else if (layer.type == "overlay") {
          indexToDelete = this.overlays.indexOf(layer);
          this.overlays.splice(indexToDelete, 1);
        }

        ALEvent.GRAPHIC_OVERLAY_LAYER_REMOVED.dispatchedTo(this.aladinDiv, {
          layer: layer,
        });
        this.requestRedraw();
      };

      View.prototype.addCatalog = function (catalog) {
        catalog.name = this.makeUniqLayerName(catalog.name);
        this.allOverlayLayers.push(catalog);
        this.catalogs.push(catalog);

        if (catalog.type == "catalog") {
          catalog.setView(this);
        } else if (catalog.type == "progressivecat") {
          catalog.init(this);
        }
      };

      View.prototype.addOverlay = function (overlay) {
        overlay.name = this.makeUniqLayerName(overlay.name);
        this.overlays.push(overlay);
        this.allOverlayLayers.push(overlay);
        overlay.setView(this);
      };

      View.prototype.addMOC = function (moc) {
        moc.name = this.makeUniqLayerName(moc.name);
        this.mocs.push(moc);
        this.allOverlayLayers.push(moc);
        moc.setView(this);
      };

      View.prototype.getObjectsInBBox = function (x, y, w, h) {
        if (w < 0) {
          x = x + w;
          w = -w;
        }

        if (h < 0) {
          y = y + h;
          h = -h;
        }

        var objList = [];
        var cat, sources, s;

        if (this.catalogs) {
          for (var k = 0; k < this.catalogs.length; k++) {
            cat = this.catalogs[k];

            if (!cat.isShowing) {
              continue;
            }

            sources = cat.getSources();

            for (var l = 0; l < sources.length; l++) {
              s = sources[l];

              if (!s.isShowing || !s.x || !s.y) {
                continue;
              }

              if (s.x >= x && s.x <= x + w && s.y >= y && s.y <= y + h) {
                objList.push(s);
              }
            }
          }
        }

        return objList;
      }; // update objLookup, lookup table

      View.prototype.updateObjectsLookup = function () {
        this.objLookup = [];
        var cat, sources, s, xRounded, yRounded;

        if (this.catalogs) {
          for (var k = 0; k < this.catalogs.length; k++) {
            cat = this.catalogs[k];

            if (!cat.isShowing) {
              continue;
            }

            sources = cat.getSources();

            for (var l = 0; l < sources.length; l++) {
              s = sources[l];

              if (!s.isShowing || !s.x || !s.y) {
                continue;
              }

              xRounded = Math.round(s.x);
              yRounded = Math.round(s.y);

              if (typeof this.objLookup[xRounded] === "undefined") {
                this.objLookup[xRounded] = [];
              }

              if (typeof this.objLookup[xRounded][yRounded] === "undefined") {
                this.objLookup[xRounded][yRounded] = [];
              }

              this.objLookup[xRounded][yRounded].push(s);
            }
          }
        }
      }; // return closest object within a radius of maxRadius pixels. maxRadius is an integer

      View.prototype.closestObjects = function (x, y, maxRadius) {
        // footprint selection code adapted from Fabrizio Giordano dev. from Serco for ESA/ESDC
        var overlay;
        var canvas = this.catalogCanvas;
        var ctx = canvas.getContext("2d"); // this makes footprint selection easier as the catch-zone is larger

        ctx.lineWidth = 6;

        if (this.overlays) {
          for (var k = 0; k < this.overlays.length; k++) {
            overlay = this.overlays[k];

            for (var i = 0; i < overlay.overlays.length; i++) {
              // test polygons first
              var footprint = overlay.overlays[i];
              var pointXY = [];

              for (var j = 0; j < footprint.polygons.length; j++) {
                /*var xy = AladinUtils.radecToViewXy(footprint.polygons[j][0], footprint.polygons[j][1],
                    this.projection,
                    this.cooFrame,
                    this.width, this.height,
                    this.largestDim,
                    this.zoomFactor);*/
                var xy = AladinUtils.radecToViewXy(footprint.polygons[j][0], footprint.polygons[j][1], this);

                if (!xy) {
                  continue;
                }

                pointXY.push({
                  x: xy[0],
                  y: xy[1],
                });
              }

              for (var l = 0; l < pointXY.length - 1; l++) {
                ctx.beginPath(); // new segment

                ctx.moveTo(pointXY[l].x, pointXY[l].y); // start is current point

                ctx.lineTo(pointXY[l + 1].x, pointXY[l + 1].y); // end point is next

                if (ctx.isPointInStroke(x, y)) {
                  // x,y is on line?
                  closest = footprint;
                  return [closest];
                }
              }
            } // test Circles

            for (var i = 0; i < overlay.overlay_items.length; i++) {
              if (overlay.overlay_items[i] instanceof Circle) {
                overlay.overlay_items[i].draw(
                  ctx,
                  this,
                  this.projection,
                  this.cooFrame,
                  this.width,
                  this.height,
                  this.largestDim,
                  this.zoomFactor,
                  true
                );

                if (ctx.isPointInStroke(x, y)) {
                  closest = overlay.overlay_items[i];
                  return [closest];
                }
              }
            }
          }
        }

        if (!this.objLookup) {
          return null;
        }

        var closest, dist;

        for (var r = 0; r <= maxRadius; r++) {
          closest = dist = null;

          for (var dx = -maxRadius; dx <= maxRadius; dx++) {
            if (!this.objLookup[x + dx]) {
              continue;
            }

            for (var dy = -maxRadius; dy <= maxRadius; dy++) {
              if (this.objLookup[x + dx][y + dy]) {
                var d = dx * dx + dy * dy;

                if (!closest) {
                  closest = this.objLookup[x + dx][y + dy];
                  dist = d;
                } else if (d < dist) {
                  dist = d;
                  closest = this.objLookup[x + dx][y + dy];
                }
              }
            }
          }

          if (closest) {
            return closest;
          }
        }

        return null;
      };

      return View;
    })(); // CONCATENATED MODULE: ./src/js/libs/fits.js
    var astro = (function () {
      var astro = {};

      var Base,
        BinaryTable,
        CompressedImage,
        DataUnit,
        Decompress,
        FITS,
        HDU,
        Header,
        HeaderVerify,
        Image,
        ImageUtils,
        Parser,
        Table,
        Tabular,
        _ref,
        _ref1,
        __hasProp = {}.hasOwnProperty,
        __extends = function __extends(child, parent) {
          for (var key in parent) {
            if (__hasProp.call(parent, key)) child[key] = parent[key];
          }

          function ctor() {
            this.constructor = child;
          }

          ctor.prototype = parent.prototype;
          child.prototype = new ctor();
          child.__super__ = parent.prototype;
          return child;
        },
        __slice = [].slice;

      Base = (function () {
        function Base() {}

        Base.include = function (obj) {
          var key, value;

          for (key in obj) {
            value = obj[key];
            this.prototype[key] = value;
          }

          return this;
        };

        Base.extend = function (obj) {
          var key, value;

          for (key in obj) {
            value = obj[key];
            this[key] = value;
          }

          return this;
        };

        Base.prototype.proxy = function (func) {
          var _this = this;

          return function () {
            return func.apply(_this, arguments);
          };
        };

        Base.prototype.invoke = function (callback, opts, data) {
          var context;
          context = (opts != null ? opts.context : void 0) != null ? opts.context : this;

          if (callback != null) {
            return callback.call(context, data, opts);
          }
        };

        return Base;
      })();

      Parser = (function (_super) {
        __extends(Parser, _super);

        Parser.prototype.LINEWIDTH = 80;
        Parser.prototype.BLOCKLENGTH = 2880;
        File.prototype.slice = File.prototype.slice || File.prototype.webkitSlice;
        Blob.prototype.slice = Blob.prototype.slice || Blob.prototype.webkitSlice;

        function Parser(arg, callback, opts) {
          var xhr,
            _this = this;

          this.arg = arg;
          this.callback = callback;
          this.opts = opts;
          this.hdus = [];
          this.blockCount = 0;
          this.begin = 0;
          this.end = this.BLOCKLENGTH;
          this.offset = 0;
          this.headerStorage = new Uint8Array();

          if (typeof this.arg === "string") {
            this.readNextBlock = this._readBlockFromBuffer;
            xhr = new XMLHttpRequest();
            xhr.open("GET", this.arg);
            xhr.responseType = "arraybuffer"; // the onerror handling has been added wrt the original fitsjs library as retrieved on the astrojs github repo
            // if an error occurs, we return an empty object

            xhr.onerror = function () {
              _this.invoke(_this.callback, _this.opts);
            };

            xhr.onload = function () {
              if (xhr.status !== 200) {
                _this.invoke(_this.callback, _this.opts);

                return;
              }

              _this.arg = xhr.response;
              _this.length = _this.arg.byteLength;
              return _this.readFromBuffer();
            };

            xhr.send();
          } else {
            this.length = this.arg.size;
            this.readNextBlock = this._readBlockFromFile;
            this.readFromFile();
          }
        }

        Parser.prototype.readFromBuffer = function () {
          var block;
          block = this.arg.slice(this.begin + this.offset, this.end + this.offset);
          return this.readBlock(block);
        };

        Parser.prototype.readFromFile = function () {
          var block,
            _this = this;

          this.reader = new FileReader();

          this.reader.onloadend = function (e) {
            return _this.readBlock(e.target.result);
          };

          block = this.arg.slice(this.begin + this.offset, this.end + this.offset);
          return this.reader.readAsArrayBuffer(block);
        };

        Parser.prototype.readBlock = function (block) {
          var arr, dataLength, dataunit, header, rowIndex, rows, s, slice, tmp, value, _i, _len, _ref;

          arr = new Uint8Array(block);
          tmp = new Uint8Array(this.headerStorage);
          this.headerStorage = new Uint8Array(this.end);
          this.headerStorage.set(tmp, 0);
          this.headerStorage.set(arr, this.begin);
          rows = this.BLOCKLENGTH / this.LINEWIDTH;

          while (rows--) {
            rowIndex = rows * this.LINEWIDTH;

            if (arr[rowIndex] === 32) {
              continue;
            }

            if (arr[rowIndex] === 69 && arr[rowIndex + 1] === 78 && arr[rowIndex + 2] === 68 && arr[rowIndex + 3] === 32) {
              s = "";
              _ref = this.headerStorage;

              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                value = _ref[_i];
                s += String.fromCharCode(value);
              }

              header = new Header(s);
              this.start = this.end + this.offset;
              dataLength = header.getDataLength();
              slice = this.arg.slice(this.start, this.start + dataLength);

              if (header.hasDataUnit()) {
                dataunit = this.createDataUnit(header, slice);
              }

              this.hdus.push(new HDU(header, dataunit));
              this.offset += this.end + dataLength + this.excessBytes(dataLength);

              if (this.offset === this.length) {
                this.headerStorage = null;
                this.invoke(this.callback, this.opts, this);
                return;
              }

              this.blockCount = 0;
              this.begin = this.blockCount * this.BLOCKLENGTH;
              this.end = this.begin + this.BLOCKLENGTH;
              this.headerStorage = new Uint8Array();
              block = this.arg.slice(this.begin + this.offset, this.end + this.offset);
              this.readNextBlock(block);
              return;
            }

            break;
          }

          this.blockCount += 1;
          this.begin = this.blockCount * this.BLOCKLENGTH;
          this.end = this.begin + this.BLOCKLENGTH;
          block = this.arg.slice(this.begin + this.offset, this.end + this.offset);
          this.readNextBlock(block);
        };

        Parser.prototype._readBlockFromBuffer = function (block) {
          return this.readBlock(block);
        };

        Parser.prototype._readBlockFromFile = function (block) {
          return this.reader.readAsArrayBuffer(block);
        };

        Parser.prototype.createDataUnit = function (header, blob) {
          var type;
          type = header.getDataType();
          return new astro.FITS[type](header, blob);
        };

        Parser.prototype.excessBytes = function (length) {
          return (this.BLOCKLENGTH - (length % this.BLOCKLENGTH)) % this.BLOCKLENGTH;
        };

        Parser.prototype.isEOF = function () {
          if (this.offset === this.length) {
            return true;
          } else {
            return false;
          }
        };

        return Parser;
      })(Base);

      FITS = (function (_super) {
        __extends(FITS, _super);

        function FITS(arg, callback, opts) {
          var parser,
            _this = this;

          this.arg = arg;
          parser = new Parser(this.arg, function (fits) {
            _this.hdus = parser.hdus;
            return _this.invoke(callback, opts, _this);
          });
        }

        FITS.prototype.getHDU = function (index) {
          var hdu, _i, _len, _ref;

          if (index != null && this.hdus[index] != null) {
            return this.hdus[index];
          }

          _ref = this.hdus;

          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            hdu = _ref[_i];

            if (hdu.hasData()) {
              return hdu;
            }
          }
        };

        FITS.prototype.getHeader = function (index) {
          return this.getHDU(index).header;
        };

        FITS.prototype.getDataUnit = function (index) {
          return this.getHDU(index).data;
        };

        return FITS;
      })(Base);

      FITS.version = "0.6.5";
      astro.FITS = FITS;

      DataUnit = (function (_super) {
        __extends(DataUnit, _super);

        DataUnit.swapEndian = {
          B: function B(value) {
            return value;
          },
          I: function I(value) {
            return (value << 8) | (value >> 8);
          },
          J: function J(value) {
            return ((value & 0xff) << 24) | ((value & 0xff00) << 8) | ((value >> 8) & 0xff00) | ((value >> 24) & 0xff);
          },
        };
        DataUnit.swapEndian[8] = DataUnit.swapEndian["B"];
        DataUnit.swapEndian[16] = DataUnit.swapEndian["I"];
        DataUnit.swapEndian[32] = DataUnit.swapEndian["J"];

        function DataUnit(header, data) {
          if (data instanceof ArrayBuffer) {
            this.buffer = data;
          } else {
            this.blob = data;
          }
        }

        return DataUnit;
      })(Base);

      astro.FITS.DataUnit = DataUnit;
      HeaderVerify = {
        verifyOrder: function verifyOrder(keyword, order) {
          if (order !== this.cardIndex) {
            return console.warn("" + keyword + " should appear at index " + this.cardIndex + " in the FITS header");
          }
        },
        verifyBetween: function verifyBetween(keyword, value, lower, upper) {
          if (!(value >= lower && value <= upper)) {
            throw "The " + keyword + " value of " + value + " is not between " + lower + " and " + upper;
          }
        },
        verifyBoolean: function verifyBoolean(value) {
          if (value === "T") {
            return true;
          } else {
            return false;
          }
        },
        VerifyFns: {
          SIMPLE: function SIMPLE() {
            var args, value;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            value = arguments[0];
            this.primary = true;
            this.verifyOrder("SIMPLE", 0);
            return this.verifyBoolean(value);
          },
          XTENSION: function XTENSION() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            this.extension = true;
            this.extensionType = arguments[0];
            this.verifyOrder("XTENSION", 0);
            return this.extensionType;
          },
          BITPIX: function BITPIX() {
            var args, key, value;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            key = "BITPIX";
            value = parseInt(arguments[0]);
            this.verifyOrder(key, 1);

            if (value !== 8 && value !== 16 && value !== 32 && value !== -32 && value !== -64) {
              throw "" + key + " value " + value + " is not permitted";
            }

            return value;
          },
          NAXIS: function NAXIS() {
            var args, array, key, required, value, _ref;

            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            key = "NAXIS";
            value = parseInt(arguments[0]);
            array = arguments[1];

            if (!array) {
              this.verifyOrder(key, 2);
              this.verifyBetween(key, value, 0, 999);

              if (this.isExtension()) {
                if ((_ref = this.extensionType) === "TABLE" || _ref === "BINTABLE") {
                  required = 2;

                  if (value !== required) {
                    throw "" + key + " must be " + required + " for TABLE and BINTABLE extensions";
                  }
                }
              }
            }

            return value;
          },
          PCOUNT: function PCOUNT() {
            var args, key, order, required, value, _ref;

            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            key = "PCOUNT";
            value = parseInt(arguments[0]);
            order = 1 + 1 + 1 + this.get("NAXIS");
            this.verifyOrder(key, order);

            if (this.isExtension()) {
              if ((_ref = this.extensionType) === "IMAGE" || _ref === "TABLE") {
                required = 0;

                if (value !== required) {
                  throw "" + key + " must be " + required + " for the " + this.extensionType + " extensions";
                }
              }
            }

            return value;
          },
          GCOUNT: function GCOUNT() {
            var args, key, order, required, value, _ref;

            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            key = "GCOUNT";
            value = parseInt(arguments[0]);
            order = 1 + 1 + 1 + this.get("NAXIS") + 1;
            this.verifyOrder(key, order);

            if (this.isExtension()) {
              if ((_ref = this.extensionType) === "IMAGE" || _ref === "TABLE" || _ref === "BINTABLE") {
                required = 1;

                if (value !== required) {
                  throw "" + key + " must be " + required + " for the " + this.extensionType + " extensions";
                }
              }
            }

            return value;
          },
          EXTEND: function EXTEND() {
            var args, value;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            value = arguments[0];

            if (!this.isPrimary()) {
              throw "EXTEND must only appear in the primary header";
            }

            return this.verifyBoolean(value);
          },
          BSCALE: function BSCALE() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return parseFloat(arguments[0]);
          },
          BZERO: function BZERO() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return parseFloat(arguments[0]);
          },
          BLANK: function BLANK() {
            var args, value;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            value = arguments[0];

            if (!(this.get("BITPIX") > 0)) {
              console.warn("BLANK is not to be used for BITPIX = " + this.get("BITPIX"));
            }

            return parseInt(value);
          },
          DATAMIN: function DATAMIN() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return parseFloat(arguments[0]);
          },
          DATAMAX: function DATAMAX() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return parseFloat(arguments[0]);
          },
          EXTVER: function EXTVER() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return parseInt(arguments[0]);
          },
          EXTLEVEL: function EXTLEVEL() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return parseInt(arguments[0]);
          },
          TFIELDS: function TFIELDS() {
            var args, value;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            value = parseInt(arguments[0]);
            this.verifyBetween("TFIELDS", value, 0, 999);
            return value;
          },
          TBCOL: function TBCOL() {
            var args, index, value;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            value = arguments[0];
            index = arguments[2];
            this.verifyBetween("TBCOL", index, 0, this.get("TFIELDS"));
            return value;
          },
          ZIMAGE: function ZIMAGE() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return this.verifyBoolean(arguments[0]);
          },
          ZCMPTYPE: function ZCMPTYPE() {
            var args, value;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            value = arguments[0];

            if (value !== "GZIP_1" && value !== "RICE_1" && value !== "PLIO_1" && value !== "HCOMPRESS_1") {
              throw "ZCMPTYPE value " + value + " is not permitted";
            }

            if (value !== "RICE_1") {
              throw "Compress type " + value + " is not yet implement";
            }

            return value;
          },
          ZBITPIX: function ZBITPIX() {
            var args, value;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            value = parseInt(arguments[0]);

            if (value !== 8 && value !== 16 && value !== 32 && value !== 64 && value !== -32 && value !== -64) {
              throw "ZBITPIX value " + value + " is not permitted";
            }

            return value;
          },
          ZNAXIS: function ZNAXIS() {
            var args, array, value;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            value = parseInt(arguments[0]);
            array = arguments[1];
            value = value;

            if (!array) {
              this.verifyBetween("ZNAXIS", value, 0, 999);
            }

            return value;
          },
          ZTILE: function ZTILE() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return parseInt(arguments[0]);
          },
          ZSIMPLE: function ZSIMPLE() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];

            if (arguments[0] === "T") {
              return true;
            } else {
              return false;
            }
          },
          ZPCOUNT: function ZPCOUNT() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return parseInt(arguments[0]);
          },
          ZGCOUNT: function ZGCOUNT() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return parseInt(arguments[0]);
          },
          ZDITHER0: function ZDITHER0() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return parseInt(arguments[0]);
          },
        },
      };
      astro.FITS.HeaderVerify = HeaderVerify;

      Header = (function (_super) {
        __extends(Header, _super);

        Header.include(HeaderVerify);
        Header.prototype.arrayPattern = /(\D+)(\d+)/;
        Header.prototype.maxLines = 600;

        function Header(block) {
          var method, name, _ref;

          this.primary = false;
          this.extension = false;
          this.verifyCard = {};
          _ref = this.VerifyFns;

          for (name in _ref) {
            method = _ref[name];
            this.verifyCard[name] = this.proxy(method);
          }

          this.cards = {};
          this.cards["COMMENT"] = [];
          this.cards["HISTORY"] = [];
          this.cardIndex = 0;
          this.block = block;
          this.readBlock(block);
        }

        Header.prototype.get = function (key) {
          if (this.contains(key)) {
            return this.cards[key].value;
          } else {
            return null;
          }
        };

        Header.prototype.set = function (key, value, comment) {
          comment = comment || "";
          this.cards[key] = {
            index: this.cardIndex,
            value: value,
            comment: comment,
          };
          return (this.cardIndex += 1);
        };

        Header.prototype.contains = function (key) {
          return this.cards.hasOwnProperty(key);
        };

        Header.prototype.readLine = function (l) {
          var blank, comment, firstByte, indicator, key, value, _ref;

          key = l.slice(0, 8).trim();
          blank = key === "";

          if (blank) {
            return;
          }

          indicator = l.slice(8, 10);
          value = l.slice(10);

          if (indicator !== "= ") {
            if (key === "COMMENT" || key === "HISTORY") {
              this.cards[key].push(value.trim());
            }

            return;
          }

          (_ref = value.split(" /")), (value = _ref[0]), (comment = _ref[1]);
          value = value.trim();
          firstByte = value[0];

          if (firstByte === "'") {
            value = value.slice(1, -1).trim();
          } else {
            if (value !== "T" && value !== "F") {
              value = parseFloat(value);
            }
          }

          value = this.validate(key, value);
          return this.set(key, value, comment);
        };

        Header.prototype.validate = function (key, value) {
          var baseKey, index, isArray, match, _ref;

          index = null;
          baseKey = key;
          isArray = this.arrayPattern.test(key);

          if (isArray) {
            match = this.arrayPattern.exec(key);
            (_ref = match.slice(1)), (baseKey = _ref[0]), (index = _ref[1]);
          }

          if (baseKey in this.verifyCard) {
            value = this.verifyCard[baseKey](value, isArray, index);
          }

          return value;
        };

        Header.prototype.readBlock = function (block) {
          var i, line, lineWidth, nLines, _i, _ref, _results;

          lineWidth = 80;
          nLines = block.length / lineWidth;
          nLines = nLines < this.maxLines ? nLines : this.maxLines;
          _results = [];

          for (i = _i = 0, _ref = nLines - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
            line = block.slice(i * lineWidth, (i + 1) * lineWidth);

            _results.push(this.readLine(line));
          }

          return _results;
        };

        Header.prototype.hasDataUnit = function () {
          if (this.get("NAXIS") === 0) {
            return false;
          } else {
            return true;
          }
        };

        Header.prototype.getDataLength = function () {
          var i, length, naxis, _i, _ref;

          if (!this.hasDataUnit()) {
            return 0;
          }

          naxis = [];

          for (i = _i = 1, _ref = this.get("NAXIS"); 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
            naxis.push(this.get("NAXIS" + i));
          }

          length =
            (naxis.reduce(function (a, b) {
              return a * b;
            }) *
              Math.abs(this.get("BITPIX"))) /
            8;
          length += this.get("PCOUNT");
          return length;
        };

        Header.prototype.getDataType = function () {
          switch (this.extensionType) {
            case "BINTABLE":
              if (this.contains("ZIMAGE")) {
                return "CompressedImage";
              }

              return "BinaryTable";

            case "TABLE":
              return "Table";

            default:
              if (this.hasDataUnit()) {
                return "Image";
              } else {
                return null;
              }
          }
        };

        Header.prototype.isPrimary = function () {
          return this.primary;
        };

        Header.prototype.isExtension = function () {
          return this.extension;
        };

        return Header;
      })(Base);

      astro.FITS.Header = Header;
      ImageUtils = {
        getExtent: function getExtent(arr) {
          var index, max, min, value;
          index = arr.length;

          while (index--) {
            value = arr[index];

            if (isNaN(value)) {
              continue;
            }

            min = max = value;
            break;
          }

          if (index === -1) {
            return [NaN, NaN];
          }

          while (index--) {
            value = arr[index];

            if (isNaN(value)) {
              continue;
            }

            if (value < min) {
              min = value;
            }

            if (value > max) {
              max = value;
            }
          }

          return [min, max];
        },
        getPixel: function getPixel(arr, x, y) {
          return arr[y * this.width + x];
        },
      };
      astro.FITS.ImageUtils = ImageUtils;

      Image = (function (_super) {
        __extends(Image, _super);

        Image.include(ImageUtils);
        Image.prototype.allocationSize = 16777216;

        function Image(header, data) {
          var begin, frame, i, naxis, _i, _j, _ref;

          Image.__super__.constructor.apply(this, arguments);

          naxis = header.get("NAXIS");
          this.bitpix = header.get("BITPIX");
          this.naxis = [];

          for (i = _i = 1; 1 <= naxis ? _i <= naxis : _i >= naxis; i = 1 <= naxis ? ++_i : --_i) {
            this.naxis.push(header.get("NAXIS" + i));
          }

          this.width = header.get("NAXIS1");
          this.height = header.get("NAXIS2") || 1;
          this.depth = header.get("NAXIS3") || 1;
          this.bzero = header.get("BZERO") || 0;
          this.bscale = header.get("BSCALE") || 1;
          this.bytes = Math.abs(this.bitpix) / 8;
          this.length =
            (this.naxis.reduce(function (a, b) {
              return a * b;
            }) *
              Math.abs(this.bitpix)) /
            8;
          this.frame = 0;
          this.frameOffsets = [];
          this.frameLength = this.bytes * this.width * this.height;
          this.nBuffers = this.buffer != null ? 1 : 2;

          for (i = _j = 0, _ref = this.depth - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; i = 0 <= _ref ? ++_j : --_j) {
            begin = i * this.frameLength;
            frame = {
              begin: begin,
            };

            if (this.buffer != null) {
              frame.buffers = [this.buffer.slice(begin, begin + this.frameLength)];
            }

            this.frameOffsets.push(frame);
          }
        }

        Image.prototype._getFrame = function (buffer, bitpix, bzero, bscale) {
          var arr, bytes, dataType, i, nPixels, swapEndian, tmp, value;
          bytes = Math.abs(bitpix) / 8;
          nPixels = i = buffer.byteLength / bytes;
          dataType = Math.abs(bitpix);

          if (bitpix > 0) {
            switch (bitpix) {
              case 8:
                tmp = new Uint8Array(buffer);
                tmp = new Uint16Array(tmp);

                swapEndian = function swapEndian(value) {
                  return value;
                };

                break;

              case 16:
                tmp = new Int16Array(buffer);

                swapEndian = function swapEndian(value) {
                  return ((value & 0xff) << 8) | ((value >> 8) & 0xff);
                };

                break;

              case 32:
                tmp = new Int32Array(buffer);

                swapEndian = function swapEndian(value) {
                  return ((value & 0xff) << 24) | ((value & 0xff00) << 8) | ((value >> 8) & 0xff00) | ((value >> 24) & 0xff);
                };
            }

            if (!(parseInt(bzero) === bzero && parseInt(bscale) === bscale)) {
              arr = new Float32Array(tmp.length);
            } else {
              arr = tmp;
            }

            while (nPixels--) {
              tmp[nPixels] = swapEndian(tmp[nPixels]);
              arr[nPixels] = bzero + bscale * tmp[nPixels];
            }
          } else {
            arr = new Uint32Array(buffer);

            swapEndian = function swapEndian(value) {
              return ((value & 0xff) << 24) | ((value & 0xff00) << 8) | ((value >> 8) & 0xff00) | ((value >> 24) & 0xff);
            };

            while (i--) {
              value = arr[i];
              arr[i] = swapEndian(value);
            }

            arr = new Float32Array(buffer);

            while (nPixels--) {
              arr[nPixels] = bzero + bscale * arr[nPixels];
            }
          }

          return arr;
        };

        Image.prototype._getFrameAsync = function (buffers, callback, opts) {
          var URL,
            blobGetFrame,
            blobOnMessage,
            fn1,
            fn2,
            i,
            mime,
            msg,
            onmessage,
            pixels,
            start,
            urlGetFrame,
            urlOnMessage,
            worker,
            _this = this;

          onmessage = function onmessage(e) {
            var arr, bitpix, bscale, buffer, bzero, data, url;
            data = e.data;
            buffer = data.buffer;
            bitpix = data.bitpix;
            bzero = data.bzero;
            bscale = data.bscale;
            url = data.url;
            importScripts(url);
            arr = _getFrame(buffer, bitpix, bzero, bscale);
            return postMessage(arr);
          };

          fn1 = onmessage.toString().replace("return postMessage", "postMessage");
          fn1 = "onmessage = " + fn1;
          fn2 = this._getFrame.toString();
          fn2 = fn2.replace("function", "function _getFrame");
          mime = "application/javascript";
          blobOnMessage = new Blob([fn1], {
            type: mime,
          });
          blobGetFrame = new Blob([fn2], {
            type: mime,
          });
          URL = window.URL || window.webkitURL;
          urlOnMessage = URL.createObjectURL(blobOnMessage);
          urlGetFrame = URL.createObjectURL(blobGetFrame);
          worker = new Worker(urlOnMessage);
          msg = {
            buffer: buffers[0],
            bitpix: this.bitpix,
            bzero: this.bzero,
            bscale: this.bscale,
            url: urlGetFrame,
          };
          i = 0;
          pixels = null;
          start = 0;

          worker.onmessage = function (e) {
            var arr;
            arr = e.data;

            if (pixels == null) {
              pixels = new arr.constructor(_this.width * _this.height);
            }

            pixels.set(arr, start);
            start += arr.length;
            i += 1;

            if (i === _this.nBuffers) {
              _this.invoke(callback, opts, pixels);

              URL.revokeObjectURL(urlOnMessage);
              URL.revokeObjectURL(urlGetFrame);
              return worker.terminate();
            } else {
              msg.buffer = buffers[i];
              return worker.postMessage(msg, [buffers[i]]);
            }
          };

          worker.postMessage(msg, [buffers[0]]);
        };

        Image.prototype.getFrame = function (frame, callback, opts) {
          var begin,
            blobFrame,
            blobs,
            buffers,
            bytesPerBuffer,
            frameInfo,
            i,
            nRowsPerBuffer,
            reader,
            start,
            _i,
            _ref,
            _this = this;

          this.frame = frame || this.frame;
          frameInfo = this.frameOffsets[this.frame];
          buffers = frameInfo.buffers;

          if ((buffers != null ? buffers.length : void 0) === this.nBuffers) {
            return this._getFrameAsync(buffers, callback, opts);
          } else {
            this.frameOffsets[this.frame].buffers = [];
            begin = frameInfo.begin;
            blobFrame = this.blob.slice(begin, begin + this.frameLength);
            blobs = [];
            nRowsPerBuffer = Math.floor(this.height / this.nBuffers);
            bytesPerBuffer = nRowsPerBuffer * this.bytes * this.width;

            for (i = _i = 0, _ref = this.nBuffers - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
              start = i * bytesPerBuffer;

              if (i === this.nBuffers - 1) {
                blobs.push(blobFrame.slice(start));
              } else {
                blobs.push(blobFrame.slice(start, start + bytesPerBuffer));
              }
            }

            buffers = [];
            reader = new FileReader();
            reader.frame = this.frame;
            i = 0;

            reader.onloadend = function (e) {
              var buffer;
              frame = e.target.frame;
              buffer = e.target.result;

              _this.frameOffsets[frame].buffers.push(buffer);

              i += 1;

              if (i === _this.nBuffers) {
                return _this.getFrame(frame, callback, opts);
              } else {
                return reader.readAsArrayBuffer(blobs[i]);
              }
            };

            return reader.readAsArrayBuffer(blobs[0]);
          }
        };

        Image.prototype.getFrames = function (frame, number, callback, opts) {
          var _cb,
            _this = this;

          _cb = function cb(arr, opts) {
            _this.invoke(callback, opts, arr);

            number -= 1;
            frame += 1;

            if (!number) {
              return;
            }

            return _this.getFrame(frame, _cb, opts);
          };

          return this.getFrame(frame, _cb, opts);
        };

        Image.prototype.isDataCube = function () {
          if (this.naxis.length > 2) {
            return true;
          } else {
            return false;
          }
        };

        return Image;
      })(DataUnit);

      astro.FITS.Image = Image;

      Tabular = (function (_super) {
        __extends(Tabular, _super);

        Tabular.prototype.maxMemory = 1048576;

        function Tabular(header, data) {
          Tabular.__super__.constructor.apply(this, arguments);

          this.rowByteSize = header.get("NAXIS1");
          this.rows = header.get("NAXIS2");
          this.cols = header.get("TFIELDS");
          this.length = this.rowByteSize * this.rows;
          this.heapLength = header.get("PCOUNT");
          this.columns = this.getColumns(header);

          if (this.buffer != null) {
            this.rowsInMemory = this._rowsInMemoryBuffer;
            this.heap = this.buffer.slice(this.length, this.length + this.heapLength);
          } else {
            this.rowsInMemory = this._rowsInMemoryBlob;
            this.firstRowInBuffer = this.lastRowInBuffer = 0;
            this.nRowsInBuffer = Math.floor(this.maxMemory / this.rowByteSize);
          }

          this.accessors = [];
          this.descriptors = [];
          this.elementByteLengths = [];
          this.setAccessors(header);
        }

        Tabular.prototype._rowsInMemoryBuffer = function () {
          return true;
        };

        Tabular.prototype._rowsInMemoryBlob = function (firstRow, lastRow) {
          if (firstRow < this.firstRowInBuffer) {
            return false;
          }

          if (lastRow > this.lastRowInBuffer) {
            return false;
          }

          return true;
        };

        Tabular.prototype.getColumns = function (header) {
          var columns, i, key, _i, _ref;

          columns = [];

          for (i = _i = 1, _ref = this.cols; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
            key = "TTYPE" + i;

            if (!header.contains(key)) {
              return null;
            }

            columns.push(header.get(key));
          }

          return columns;
        };

        Tabular.prototype.getColumn = function (name, callback, opts) {
          var accessor,
            _cb2,
            column,
            descriptor,
            elementByteLength,
            elementByteOffset,
            factor,
            i,
            index,
            iterations,
            rowsPerIteration,
            _this = this;

          if (this.blob != null) {
            index = this.columns.indexOf(name);
            descriptor = this.descriptors[index];
            accessor = this.accessors[index];
            elementByteLength = this.elementByteLengths[index];
            elementByteOffset = this.elementByteLengths.slice(0, index);

            if (elementByteOffset.length === 0) {
              elementByteOffset = 0;
            } else {
              elementByteOffset = elementByteOffset.reduce(function (a, b) {
                return a + b;
              });
            }

            column = this.typedArray[descriptor] != null ? new this.typedArray[descriptor](this.rows) : [];
            rowsPerIteration = ~~(this.maxMemory / this.rowByteSize);
            rowsPerIteration = Math.min(rowsPerIteration, this.rows);
            factor = this.rows / rowsPerIteration;
            iterations = Math.floor(factor) === factor ? factor : Math.floor(factor) + 1;
            i = 0;
            index = 0;

            _cb2 = function cb(buffer, opts) {
              var nRows, offset, startRow, view;
              nRows = buffer.byteLength / _this.rowByteSize;
              view = new DataView(buffer);
              offset = elementByteOffset;

              while (nRows--) {
                column[i] = accessor(view, offset)[0];
                i += 1;
                offset += _this.rowByteSize;
              }

              iterations -= 1;
              index += 1;

              if (iterations) {
                startRow = index * rowsPerIteration;
                return _this.getTableBuffer(startRow, rowsPerIteration, _cb2, opts);
              } else {
                _this.invoke(callback, opts, column);
              }
            };

            return this.getTableBuffer(0, rowsPerIteration, _cb2, opts);
          } else {
            _cb2 = function _cb2(rows, opts) {
              column = rows.map(function (d) {
                return d[name];
              });
              return _this.invoke(callback, opts, column);
            };

            return this.getRows(0, this.rows, _cb2, opts);
          }
        };

        Tabular.prototype.getTableBuffer = function (row, number, callback, opts) {
          var begin,
            blobRows,
            end,
            reader,
            _this = this;

          number = Math.min(this.rows - row, number);
          begin = row * this.rowByteSize;
          end = begin + number * this.rowByteSize;
          blobRows = this.blob.slice(begin, end);
          reader = new FileReader();
          reader.row = row;
          reader.number = number;

          reader.onloadend = function (e) {
            return _this.invoke(callback, opts, e.target.result);
          };

          return reader.readAsArrayBuffer(blobRows);
        };

        Tabular.prototype.getRows = function (row, number, callback, opts) {
          var begin,
            blobRows,
            buffer,
            end,
            reader,
            rows,
            _this = this;

          if (this.rowsInMemory(row, row + number)) {
            if (this.blob != null) {
              buffer = this.buffer;
            } else {
              begin = row * this.rowByteSize;
              end = begin + number * this.rowByteSize;
              buffer = this.buffer.slice(begin, end);
            }

            rows = this._getRows(buffer, number);
            this.invoke(callback, opts, rows);
            return rows;
          } else {
            begin = row * this.rowByteSize;
            end = begin + Math.max(this.nRowsInBuffer * this.rowByteSize, number * this.rowByteSize);
            blobRows = this.blob.slice(begin, end);
            reader = new FileReader();
            reader.row = row;
            reader.number = number;

            reader.onloadend = function (e) {
              var target;
              target = e.target;
              _this.buffer = target.result;
              _this.firstRowInBuffer = _this.lastRowInBuffer = target.row;
              _this.lastRowInBuffer += target.number;
              return _this.getRows(row, number, callback, opts);
            };

            return reader.readAsArrayBuffer(blobRows);
          }
        };

        return Tabular;
      })(DataUnit);

      astro.FITS.Tabular = Tabular;

      Table = (function (_super) {
        __extends(Table, _super);

        function Table() {
          _ref = Table.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        Table.prototype.dataAccessors = {
          A: function A(value) {
            return value.trim();
          },
          I: function I(value) {
            return parseInt(value);
          },
          F: function F(value) {
            return parseFloat(value);
          },
          E: function E(value) {
            return parseFloat(value);
          },
          D: function D(value) {
            return parseFloat(value);
          },
        };

        Table.prototype.setAccessors = function (header) {
          var descriptor,
            form,
            i,
            match,
            pattern,
            type,
            _i,
            _ref1,
            _results,
            _this = this;

          pattern = /([AIFED])(\d+)\.*(\d+)*/;
          _results = [];

          for (i = _i = 1, _ref1 = this.cols; 1 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 1 <= _ref1 ? ++_i : --_i) {
            form = header.get("TFORM" + i);
            type = header.get("TTYPE" + i);
            match = pattern.exec(form);
            descriptor = match[1];

            _results.push(
              (function (descriptor) {
                var accessor;

                accessor = function accessor(value) {
                  return _this.dataAccessors[descriptor](value);
                };

                return _this.accessors.push(accessor);
              })(descriptor)
            );
          }

          return _results;
        };

        Table.prototype._getRows = function (buffer) {
          var accessor, arr, begin, end, i, index, line, nRows, row, rows, subarray, value, _i, _j, _k, _len, _len1, _ref1, _ref2;

          nRows = buffer.byteLength / this.rowByteSize;
          arr = new Uint8Array(buffer);
          rows = [];

          for (i = _i = 0, _ref1 = nRows - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
            begin = i * this.rowByteSize;
            end = begin + this.rowByteSize;
            subarray = arr.subarray(begin, end);
            line = "";

            for (_j = 0, _len = subarray.length; _j < _len; _j++) {
              value = subarray[_j];
              line += String.fromCharCode(value);
            }

            line = line.trim().split(/\s+/);
            row = {};
            _ref2 = this.accessors;

            for (index = _k = 0, _len1 = _ref2.length; _k < _len1; index = ++_k) {
              accessor = _ref2[index];
              value = line[index];
              row[this.columns[index]] = accessor(value);
            }

            rows.push(row);
          }

          return rows;
        };

        return Table;
      })(Tabular);

      astro.FITS.Table = Table;

      BinaryTable = (function (_super) {
        __extends(BinaryTable, _super);

        function BinaryTable() {
          _ref1 = BinaryTable.__super__.constructor.apply(this, arguments);
          return _ref1;
        }

        BinaryTable.prototype.typedArray = {
          B: Uint8Array,
          I: Uint16Array,
          J: Uint32Array,
          E: Float32Array,
          D: Float64Array,
          1: Uint8Array,
          2: Uint16Array,
          4: Uint32Array,
        };
        BinaryTable.offsets = {
          L: 1,
          B: 1,
          I: 2,
          J: 4,
          K: 8,
          A: 1,
          E: 4,
          D: 8,
          C: 8,
          M: 16,
        };
        BinaryTable.prototype.dataAccessors = {
          L: function L(view, offset) {
            var val, x;
            x = view.getInt8(offset);
            offset += 1;
            val = x === 84 ? true : false;
            return [val, offset];
          },
          B: function B(view, offset) {
            var val;
            val = view.getUint8(offset);
            offset += 1;
            return [val, offset];
          },
          I: function I(view, offset) {
            var val;
            val = view.getInt16(offset);
            offset += 2;
            return [val, offset];
          },
          J: function J(view, offset) {
            var val;
            val = view.getInt32(offset);
            offset += 4;
            return [val, offset];
          },
          K: function K(view, offset) {
            var factor, highByte, lowByte, mod, val;
            highByte = Math.abs(view.getInt32(offset));
            offset += 4;
            lowByte = Math.abs(view.getInt32(offset));
            offset += 4;
            mod = highByte % 10;
            factor = mod ? -1 : 1;
            highByte -= mod;
            val = factor * ((highByte << 32) | lowByte);
            return [val, offset];
          },
          A: function A(view, offset) {
            var val;
            val = view.getUint8(offset);
            val = String.fromCharCode(val);
            offset += 1;
            return [val, offset];
          },
          E: function E(view, offset) {
            var val;
            val = view.getFloat32(offset);
            offset += 4;
            return [val, offset];
          },
          D: function D(view, offset) {
            var val;
            val = view.getFloat64(offset);
            offset += 8;
            return [val, offset];
          },
          C: function C(view, offset) {
            var val, val1, val2;
            val1 = view.getFloat32(offset);
            offset += 4;
            val2 = view.getFloat32(offset);
            offset += 4;
            val = [val1, val2];
            return [val, offset];
          },
          M: function M(view, offset) {
            var val, val1, val2;
            val1 = view.getFloat64(offset);
            offset += 8;
            val2 = view.getFloat64(offset);
            offset += 8;
            val = [val1, val2];
            return [val, offset];
          },
        };

        BinaryTable.prototype.toBits = function (_byte) {
          var arr, i;
          arr = [];
          i = 128;

          while (i >= 1) {
            arr.push(_byte & i ? 1 : 0);
            i /= 2;
          }

          return arr;
        };

        BinaryTable.prototype.getFromHeap = function (view, offset, descriptor) {
          var arr, heapOffset, heapSlice, i, length;
          length = view.getInt32(offset);
          offset += 4;
          heapOffset = view.getInt32(offset);
          offset += 4;
          heapSlice = this.heap.slice(heapOffset, heapOffset + length);
          arr = new this.typedArray[descriptor](heapSlice);
          i = arr.length;

          while (i--) {
            arr[i] = this.constructor.swapEndian[descriptor](arr[i]);
          }

          return [arr, offset];
        };

        BinaryTable.prototype.setAccessors = function (header) {
          var count,
            descriptor,
            form,
            i,
            isArray,
            match,
            pattern,
            type,
            _i,
            _ref2,
            _results,
            _this = this;

          pattern = /(\d*)([P|Q]*)([L|X|B|I|J|K|A|E|D|C|M]{1})/;
          _results = [];

          for (i = _i = 1, _ref2 = this.cols; 1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; i = 1 <= _ref2 ? ++_i : --_i) {
            form = header.get("TFORM" + i);
            type = header.get("TTYPE" + i);
            match = pattern.exec(form);
            count = parseInt(match[1]) || 1;
            isArray = match[2];
            descriptor = match[3];

            _results.push(
              (function (descriptor, count) {
                var accessor, nBytes;

                _this.descriptors.push(descriptor);

                _this.elementByteLengths.push(_this.constructor.offsets[descriptor] * count);

                if (isArray) {
                  switch (type) {
                    case "COMPRESSED_DATA":
                      accessor = function accessor(view, offset) {
                        var arr, pixels, _ref3;

                        (_ref3 = _this.getFromHeap(view, offset, descriptor)), (arr = _ref3[0]), (offset = _ref3[1]);
                        pixels = new _this.typedArray[_this.algorithmParameters["BYTEPIX"]](_this.ztile[0]);
                        Decompress.Rice(
                          arr,
                          _this.algorithmParameters["BLOCKSIZE"],
                          _this.algorithmParameters["BYTEPIX"],
                          pixels,
                          _this.ztile[0],
                          Decompress.RiceSetup
                        );
                        return [pixels, offset];
                      };

                      break;

                    case "GZIP_COMPRESSED_DATA":
                      accessor = function accessor(view, offset) {
                        var arr;
                        arr = new Float32Array(_this.width);
                        i = arr.length;

                        while (i--) {
                          arr[i] = NaN;
                        }

                        return [arr, offset];
                      };

                      break;

                    default:
                      accessor = function accessor(view, offset) {
                        return _this.getFromHeap(view, offset, descriptor);
                      };
                  }
                } else {
                  if (count === 1) {
                    accessor = function accessor(view, offset) {
                      var value, _ref3;

                      (_ref3 = _this.dataAccessors[descriptor](view, offset)), (value = _ref3[0]), (offset = _ref3[1]);
                      return [value, offset];
                    };
                  } else {
                    if (descriptor === "X") {
                      nBytes = Math.log(count) / Math.log(2);

                      accessor = function accessor(view, offset) {
                        var arr, bits, buffer, _byte2, bytes, _j, _len;

                        buffer = view.buffer.slice(offset, offset + nBytes);
                        bytes = new Uint8Array(buffer);
                        bits = [];

                        for (_j = 0, _len = bytes.length; _j < _len; _j++) {
                          _byte2 = bytes[_j];
                          arr = _this.toBits(_byte2);
                          bits = bits.concat(arr);
                        }

                        offset += nBytes;
                        return [bits.slice(0, +(count - 1) + 1 || 9e9), offset];
                      };
                    } else if (descriptor === "A") {
                      accessor = function accessor(view, offset) {
                        var arr, buffer, s, value, _j, _len;

                        buffer = view.buffer.slice(offset, offset + count);
                        arr = new Uint8Array(buffer);
                        s = "";

                        for (_j = 0, _len = arr.length; _j < _len; _j++) {
                          value = arr[_j];
                          s += String.fromCharCode(value);
                        }

                        s = s.trim();
                        offset += count;
                        return [s, offset];
                      };
                    } else {
                      accessor = function accessor(view, offset) {
                        var data, value, _ref3;

                        i = count;
                        data = [];

                        while (i--) {
                          (_ref3 = _this.dataAccessors[descriptor](view, offset)), (value = _ref3[0]), (offset = _ref3[1]);
                          data.push(value);
                        }

                        return [data, offset];
                      };
                    }
                  }
                }

                return _this.accessors.push(accessor);
              })(descriptor, count)
            );
          }

          return _results;
        };

        BinaryTable.prototype._getRows = function (buffer, nRows) {
          var accessor, index, offset, row, rows, value, view, _i, _len, _ref2, _ref3;

          view = new DataView(buffer);
          offset = 0;
          rows = [];

          while (nRows--) {
            row = {};
            _ref2 = this.accessors;

            for (index = _i = 0, _len = _ref2.length; _i < _len; index = ++_i) {
              accessor = _ref2[index];
              (_ref3 = accessor(view, offset)), (value = _ref3[0]), (offset = _ref3[1]);
              row[this.columns[index]] = value;
            }

            rows.push(row);
          }

          return rows;
        };

        return BinaryTable;
      })(Tabular);

      astro.FITS.BinaryTable = BinaryTable;
      Decompress = {
        RiceSetup: {
          1: function _(array) {
            var fsbits, fsmax, lastpix, pointer;
            pointer = 1;
            fsbits = 3;
            fsmax = 6;
            lastpix = array[0];
            return [fsbits, fsmax, lastpix, pointer];
          },
          2: function _(array) {
            var bytevalue, fsbits, fsmax, lastpix, pointer;
            pointer = 2;
            fsbits = 4;
            fsmax = 14;
            lastpix = 0;
            bytevalue = array[0];
            lastpix = lastpix | (bytevalue << 8);
            bytevalue = array[1];
            lastpix = lastpix | bytevalue;
            return [fsbits, fsmax, lastpix, pointer];
          },
          4: function _(array) {
            var bytevalue, fsbits, fsmax, lastpix, pointer;
            pointer = 4;
            fsbits = 5;
            fsmax = 25;
            lastpix = 0;
            bytevalue = array[0];
            lastpix = lastpix | (bytevalue << 24);
            bytevalue = array[1];
            lastpix = lastpix | (bytevalue << 16);
            bytevalue = array[2];
            lastpix = lastpix | (bytevalue << 8);
            bytevalue = array[3];
            lastpix = lastpix | bytevalue;
            return [fsbits, fsmax, lastpix, pointer];
          },
        },
        Rice: function Rice(array, blocksize, bytepix, pixels, nx, setup) {
          var b, bbits, diff, fs, fsbits, fsmax, i, imax, k, lastpix, nbits, nonzeroCount, nzero, pointer, _ref2, _ref3;

          bbits = 1 << fsbits;
          (_ref2 = setup[bytepix](array)), (fsbits = _ref2[0]), (fsmax = _ref2[1]), (lastpix = _ref2[2]), (pointer = _ref2[3]);
          nonzeroCount = new Uint8Array(256);
          nzero = 8;
          (_ref3 = [128, 255]), (k = _ref3[0]), (i = _ref3[1]);

          while (i >= 0) {
            while (i >= k) {
              nonzeroCount[i] = nzero;
              i -= 1;
            }

            k = k / 2;
            nzero -= 1;
          }

          nonzeroCount[0] = 0;
          b = array[pointer++];
          nbits = 8;
          i = 0;

          while (i < nx) {
            nbits -= fsbits;

            while (nbits < 0) {
              b = (b << 8) | array[pointer++];
              nbits += 8;
            }

            fs = (b >> nbits) - 1;
            b &= (1 << nbits) - 1;
            imax = i + blocksize;

            if (imax > nx) {
              imax = nx;
            }

            if (fs < 0) {
              while (i < imax) {
                pixels[i] = lastpix;
                i += 1;
              }
            } else if (fs === fsmax) {
              while (i < imax) {
                k = bbits - nbits;
                diff = b << k;
                k -= 8;

                while (k >= 0) {
                  b = array[pointer++];
                  diff |= b << k;
                  k -= 8;
                }

                if (nbits > 0) {
                  b = array[pointer++];
                  diff |= b >> -k;
                  b &= (1 << nbits) - 1;
                } else {
                  b = 0;
                }

                if ((diff & 1) === 0) {
                  diff = diff >> 1;
                } else {
                  diff = ~(diff >> 1);
                }

                pixels[i] = diff + lastpix;
                lastpix = pixels[i];
                i++;
              }
            } else {
              while (i < imax) {
                while (b === 0) {
                  nbits += 8;
                  b = array[pointer++];
                }

                nzero = nbits - nonzeroCount[b];
                nbits -= nzero + 1;
                b ^= 1 << nbits;
                nbits -= fs;

                while (nbits < 0) {
                  b = (b << 8) | array[pointer++];
                  nbits += 8;
                }

                diff = (nzero << fs) | (b >> nbits);
                b &= (1 << nbits) - 1;

                if ((diff & 1) === 0) {
                  diff = diff >> 1;
                } else {
                  diff = ~(diff >> 1);
                }

                pixels[i] = diff + lastpix;
                lastpix = pixels[i];
                i++;
              }
            }
          }

          return pixels;
        },
      };
      astro.FITS.Decompress = Decompress;

      CompressedImage = (function (_super) {
        __extends(CompressedImage, _super);

        CompressedImage.include(ImageUtils);
        CompressedImage.extend(Decompress);

        CompressedImage.randomGenerator = function () {
          var a, i, m, random, seed, temp, _i;

          a = 16807;
          m = 2147483647;
          seed = 1;
          random = new Float32Array(10000);

          for (i = _i = 0; _i <= 9999; i = ++_i) {
            temp = a * seed;
            seed = temp - m * parseInt(temp / m);
            random[i] = seed / m;
          }

          return random;
        };

        CompressedImage.randomSequence = CompressedImage.randomGenerator();

        function CompressedImage(header, data) {
          var i, key, value, ztile, _i, _ref2;

          CompressedImage.__super__.constructor.apply(this, arguments);

          this.zcmptype = header.get("ZCMPTYPE");
          this.zbitpix = header.get("ZBITPIX");
          this.znaxis = header.get("ZNAXIS");
          this.zblank = header.get("ZBLANK");
          this.blank = header.get("BLANK");
          this.zdither = header.get("ZDITHER0") || 0;
          this.ztile = [];

          for (i = _i = 1, _ref2 = this.znaxis; 1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; i = 1 <= _ref2 ? ++_i : --_i) {
            ztile = header.contains("ZTILE" + i) ? header.get("ZTILE" + i) : i === 1 ? header.get("ZNAXIS1") : 1;
            this.ztile.push(ztile);
          }

          this.width = header.get("ZNAXIS1");
          this.height = header.get("ZNAXIS2") || 1;
          this.algorithmParameters = {};

          if (this.zcmptype === "RICE_1") {
            this.algorithmParameters["BLOCKSIZE"] = 32;
            this.algorithmParameters["BYTEPIX"] = 4;
          }

          i = 1;

          while (true) {
            key = "ZNAME" + i;

            if (!header.contains(key)) {
              break;
            }

            value = "ZVAL" + i;
            this.algorithmParameters[header.get(key)] = header.get(value);
            i += 1;
          }

          this.zmaskcmp = header.get("ZMASKCMP");
          this.zquantiz = header.get("ZQUANTIZ") || "LINEAR_SCALING";
          this.bzero = header.get("BZERO") || 0;
          this.bscale = header.get("BSCALE") || 1;
        }

        CompressedImage.prototype._getRows = function (buffer, nRows) {
          var accessor,
            arr,
            blank,
            data,
            i,
            index,
            nTile,
            offset,
            r,
            rIndex,
            row,
            scale,
            seed0,
            seed1,
            value,
            view,
            zero,
            _i,
            _j,
            _len,
            _len1,
            _ref2,
            _ref3;

          view = new DataView(buffer);
          offset = 0;
          arr = new Float32Array(this.width * this.height);

          while (nRows--) {
            row = {};
            _ref2 = this.accessors;

            for (index = _i = 0, _len = _ref2.length; _i < _len; index = ++_i) {
              accessor = _ref2[index];
              (_ref3 = accessor(view, offset)), (value = _ref3[0]), (offset = _ref3[1]);
              row[this.columns[index]] = value;
            }

            data = row["COMPRESSED_DATA"] || row["UNCOMPRESSED_DATA"] || row["GZIP_COMPRESSED_DATA"];
            blank = row["ZBLANK"] || this.zblank;
            scale = row["ZSCALE"] || this.bscale;
            zero = row["ZZERO"] || this.bzero;
            nTile = this.height - nRows;
            seed0 = nTile + this.zdither - 1;
            seed1 = (seed0 - 1) % 10000;
            rIndex = parseInt(this.constructor.randomSequence[seed1] * 500);

            for (index = _j = 0, _len1 = data.length; _j < _len1; index = ++_j) {
              value = data[index];
              i = (nTile - 1) * this.width + index;

              if (value === -2147483647) {
                arr[i] = NaN;
              } else if (value === -2147483646) {
                arr[i] = 0;
              } else {
                r = this.constructor.randomSequence[rIndex];
                arr[i] = (value - r + 0.5) * scale + zero;
              }

              rIndex += 1;

              if (rIndex === 10000) {
                seed1 = (seed1 + 1) % 10000;
                rIndex = parseInt(this.randomSequence[seed1] * 500);
              }
            }
          }

          return arr;
        };

        CompressedImage.prototype.getFrame = function (nFrame, callback, opts) {
          var heapBlob,
            reader,
            _this = this;

          if (this.heap) {
            this.frame = nFrame || this.frame;
            return this.getRows(0, this.rows, callback, opts);
          } else {
            heapBlob = this.blob.slice(this.length, this.length + this.heapLength);
            reader = new FileReader();

            reader.onloadend = function (e) {
              _this.heap = e.target.result;
              return _this.getFrame(nFrame, callback, opts);
            };

            return reader.readAsArrayBuffer(heapBlob);
          }
        };

        return CompressedImage;
      })(BinaryTable);

      astro.FITS.CompressedImage = CompressedImage;

      HDU = (function () {
        function HDU(header, data) {
          this.header = header;
          this.data = data;
        }

        HDU.prototype.hasData = function () {
          if (this.data != null) {
            return true;
          } else {
            return false;
          }
        };

        return HDU;
      })();

      astro.FITS.HDU = HDU;
      return astro;
    })(); // CONCATENATED MODULE: ./src/js/CooConversion.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //
    var CooConversion = (function () {
      var CooConversion = {};
      CooConversion.GALACTIC_TO_J2000 = [
        -0.0548755604024359, 0.4941094279435681, -0.867666148981161, -0.8734370902479237, -0.4448296299195045, -0.1980763734646737,
        -0.4838350155267381, 0.7469822444763707, 0.4559837762325372,
      ];
      CooConversion.J2000_TO_GALACTIC = [
        -0.0548755604024359, -0.873437090247923, -0.4838350155267381, 0.4941094279435681, -0.4448296299195045, 0.7469822444763707, -0.867666148981161,
        -0.1980763734646737, 0.4559837762325372,
      ]; // adapted from www.robertmartinayers.org/tools/coordinates.html
      // radec : array of ra, dec in degrees
      // return coo in degrees

      CooConversion.Transform = function (radec, matrix) {
        // returns a radec array of two elements
        radec[0] = (radec[0] * Math.PI) / 180;
        radec[1] = (radec[1] * Math.PI) / 180;
        var r0 = new Array(Math.cos(radec[0]) * Math.cos(radec[1]), Math.sin(radec[0]) * Math.cos(radec[1]), Math.sin(radec[1]));
        var s0 = new Array(
          r0[0] * matrix[0] + r0[1] * matrix[1] + r0[2] * matrix[2],
          r0[0] * matria[3] + r0[1] * matrix[4] + r0[2] * matrix[5],
          r0[0] * matrix[6] + r0[1] * matrix[7] + r0[2] * matrix[8]
        );
        var r = Math.sqrt(s0[0] * s0[0] + s0[1] * s0[1] + s0[2] * s0[2]);
        var result = new Array(0.0, 0.0);
        result[1] = Math.asin(s0[2] / r); // New dec in range -90.0 -- +90.0
        // or use sin^2 + cos^2 = 1.0

        var cosaa = s0[0] / r / Math.cos(result[1]);
        var sinaa = s0[1] / r / Math.cos(result[1]);
        result[0] = Math.atan2(sinaa, cosaa);
        if (result[0] < 0.0) result[0] = result[0] + 2 * Math.PI;
        result[0] = (result[0] * 180) / Math.PI;
        result[1] = (result[1] * 180) / Math.PI;
        return result;
      }; // coo : array of lon, lat in degrees

      CooConversion.GalacticToJ2000 = function (coo) {
        return CooConversion.Transform(coo, CooConversion.GALACTIC_TO_J2000);
      }; // coo : array of lon, lat in degrees

      CooConversion.J2000ToGalactic = function (coo) {
        return CooConversion.Transform(coo, CooConversion.J2000_TO_GALACTIC);
      };

      return CooConversion;
    })(); // CONCATENATED MODULE: ./src/js/Color.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File Color
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/
    var Color_Color = (function () {
      var Color = {};
      Color.curIdx = 0;
      Color.colors = [
        "#ff0000",
        "#0000ff",
        "#99cc00",
        "#ffff00",
        "#000066",
        "#00ffff",
        "#9900cc",
        "#0099cc",
        "#cc9900",
        "#cc0099",
        "#00cc99",
        "#663333",
        "#ffcc9a",
        "#ff9acc",
        "#ccff33",
        "#660000",
        "#ffcc33",
        "#ff00ff",
        "#00ff00",
        "#ffffff",
      ];

      Color.getNextColor = function () {
        var c = Color.colors[Color.curIdx % Color.colors.length];
        Color.curIdx++;
        return c;
      };
      /** return most suited (ie readable) color for a label, given a background color
       * bkgdColor: color, given as a 'rgb(<r value>, <g value>, <v value>)' . This is returned by $(<element>).css('background-color')
       *
       * example call: Color.getLabelColorForBackground('rgb(3, 123, 42)')
       * adapted from http://stackoverflow.com/questions/1855884/determine-font-color-based-on-backeround-color
       */

      Color.getLabelColorForBackground = function (rgbBkgdColor) {
        var lightLabel = "#eee";
        var darkLabel = "#111";
        var rgb = rgbBkgdColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

        if (rgb == null) {
          // we return the dark label color if we can't parse the color
          return darkLabel;
        }

        var r = parseInt(rgb[1]);
        var g = parseInt(rgb[2]);
        var b = parseInt(rgb[3]);
        var d = 0; // Counting the perceptive luminance - human eye favors green color...

        var a = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        if (a < 0.5) {
          return darkLabel; // bright color --> dark font
        } else {
          return lightLabel; // dark color --> light font
        }
      }; // convert hexadecimal string to r, g, b components

      Color.hexToRgb = function (hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
          return r + r + g + g + b + b;
        });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : null;
      };

      Color.rgbToHex = function (r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      };

      return Color;
    })(); // CONCATENATED MODULE: ./src/js/MOC.js
    /******************************************************************************
     * Aladin Lite project
     *
     * File MOC
     *
     * This class represents a MOC (Nulti Order Coverage map) layer
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var MOC = (function () {
      var MOC = function MOC(options) {
        this.order = undefined;
        this.uuid = Utils.uuidv4();
        this.type = "moc"; // TODO homogenize options parsing for all kind of overlay (footprints, catalog, MOC)

        options = options || {};
        this.name = optionm.name || "MOC";
        this.color = options.color || Color_Color.getNextColor();
        this.opacity = options.opacity || 1;
        this.opacity = Math.max(0, Math.min(1, this.opacity)); // 0 <= this.opacity <= 1

        this.lineWidth = options["lineWidth"] || 1;
        this.adaptativeDisplay = options["adaptativeDisplay"] !== false;
        this.proxyCalled = false; // this is a flag to check whether we already tried to load the MOC through the proxy
        // index of MOC cells at high and low resolution

        this._highResIndexOrder3 = new Array(768);
        this._lowResIndexOrder3 = new Array(768);

        for (var k = 0; k < 768; k++) {
          this._highResIndexOrder3[k] = {};
          this._lowResIndexOrder3[k] = {};
        }

        this.nbCellsDeepestLevel = 0; // needed to compute the sky fraction of the MOC

        this.isShowing = true;
        this.ready = false;
      };

      function log2(val) {
        return Math.log(val) / Math.LN2;
      } // max norder we can currently handle (limitation of healpix.js)

      MOC.MAX_NORDER = 13; // NSIDE = 8192

      MOC.LOWRES_MAXORDER = 6; // 5 or 6 ??

      MOC.HIGHRES_MAXORDER = 11; // ??
      // TODO: options to modifiy this ?

      MOC.PIVOT_FOV = 30; // when do we switch from low res cells to high res cells (fov in degrees)
      // at end of parsing, we need to remove duplicates from the 2 indexes

      MOC.prototype._removeDuplicatesFromIndexes = function () {
        var a, aDedup;

        for (var k = 0; k < 768; k++) {
          for (var key in this._highResIndexOrder3[k]) {
            a = this._highResIndexOrder3[k][key];
            aDedup = uniq(a);
            this._highResIndexOrder3[k][key] = aDedup;
          }

          for (var key in this._lowResIndexOrder3[k]) {
            a = this._lowResIndexOrder3[k][key];
            aDedup = uniq(a);
            this._lowResIndexOrder3[k][key] = aDedup;
          }
        }
      }; // add pixel (order, ipix)

      MOC.prototype._addPix = function (order, ipix) {
        var ipixOrder3 = Math.floor(ipix * Math.pow(4, 3 - order)); // fill low and high level cells
        // 1. if order <= LOWRES_MAXORDER, just store value in low and high res cells

        if (order <= MOC.LOWRES_MAXORDER) {
          if (!(order in this._lowResIndexOrder3[ipixOrder3])) {
            this._lowResIndexOrder3[ipixOrder3][order] = [];
            this._highResIndexOrder3[ipixOrder3][order] = [];
          }

          this._lowResIndexOrder3[ipixOrder3][order].push(ipix);

          this._highResIndexOrder3[ipixOrder3][order].push(ipix);
        } // 2. if LOWRES_MAXORDER < order <= HIGHRES_MAXORDER , degrade ipix for low res cells
        else if (order <= MOC.HIGHRES_MAXORDER) {
          if (!(order in this._highResIndexOrder3[ipixOrder3])) {
            this._highResIndexOrder3[ipixOrder3][order] = [];
          }

          this._highResIndexOrder3[ipixOrder3][order].push(ipix);

          var degradedOrder = MOC.LOWRES_MAXORDER;
          var degradedIpix = Math.floor(ipix / Math.pow(4, order - degradedOrder));
          var degradedIpixOrder3 = Math.floor(degradedIpix * Math.pow(4, 3 - degradedOrder));

          if (!(degradedOrder in this._lowResIndexOrder3[degradedIpixOrder3])) {
            this._lowResIndexOrder3[degradedIpixOrder3][degradedOrder] = [];
          }

          this._lowResIndexOrder3[degradedIpixOrder3][degradedOrder].push(degradedIpix);
        } // 3. if order > HIGHRES_MAXORDER , degrade ipix for low res and high res cells
        else {
          // low res cells
          var degradedOrder = MOC.LOWRES_MAXORDER;
          var degradedIpix = Math.floor(ipix / Math.pow(4, order - degradedOrder));
          var degradedIpixOrder3 = Math.floor(degradedIpix * Math.pow(4, 3 - degradedOrder));

          if (!(degradedOrder in this._lowResIndexOrder3[degradedIpixOrder3])) {
            this._lowResIndexOrder3[degradedIpixOrder3][degradedOrder] = [];
          }

          this._lowResIndexOrder3[degradedIpixOrder3][degradedOrder].push(degradedIpix); // high res cells

          degradedOrder = MOC.HIGHRES_MAXORDER;
          degradedIpix = Math.floor(ipix / Math.pow(4, order - degradedOrder));
          var degradedIpixOrder3 = Math.floor(degradedIpix * Math.pow(4, 3 - degradedOrder));

          if (!(degradedOrder in this._highResIndexOrder3[degradedIpixOrder3])) {
            this._highResIndexOrder3[degradedIpixOrder3][degradedOrder] = [];
          }

          this._highResIndexOrder3[degradedIpixOrder3][degradedOrder].push(degradedIpix);
        }

        this.nbCellsDeepestLevel += Math.pow(4, this.order - order);
      };
      /**
       *  Return a value between 0 and 1 denoting the fraction of the sky
       *  covered by the MOC
       */

      MOC.prototype.skyFraction = function () {
        return this.nbCellsDeepestLevel / (12 * Math.pow(4, this.order));
      };
      /**
       * set MOC data by parsing a MOC serialized in JSON
       * (as defined in IVOA MOC document, section 3.1.1)
       */

      MOC.prototype.dataFromJSON = function (jsonMOC) {
        var order, ipix; // 1. Compute the order (order of the deepest cells contained in the moc)

        for (var orderStr in jsonMOC) {
          if (jsonMOC.hasOwnProperty(orderStr)) {
            order = parseInt(orderStr);

            if (this.order === undefined || order > this.order) {
              this.order = order;
            }
          }
        } // 2. Build the mocs (LOW and HIGH res ones)

        for (var orderStr in jsonMOC) {
          if (jsonMOC.hasOwnProperty(orderStr)) {
            order = parseInt(orderStr);

            for (var k = 0; k < jsonMOC[orderStr].length; k++) {
              ipix = jsonMOC[orderStr][k];

              this._addPix(order, ipix);
            }
          }
        }

        this.reportChange();
        this.ready = true;
      };
      /**
       * set MOC data by parsing a URL pointing to a FITS MOC file
       */

      MOC.prototype.dataFromFITSURL = function (mocURL, successCallback) {
        var self = this;

        var callback = function callback() {
          // note: in the callback, 'this' refers to the FITS instance
          // first, let's find MOC norder
          var hdr0;

          try {
            // A zero-length hdus array might mean the served URL does not have CORS header
            // --> let's try again through the proxy
            if (this.hdus.length == 0) {
              if (self.proxyCalled !== true) {
                self.proxyCalled = true;
                var proxiedURL = Aladin.JSONP_PROXY + "?url=" + encodeURIComponent(self.dataURL);
                new astro.FITS(proxiedURL, callback);
              }

              return;
            }

            hdr0 = this.getHeader(0);
          } catch (e) {
            console.error("Could not get header of extension #0");
            return;
          }

          var hdr1 = this.getHeader(1);

          if (hdr0.contains("HPXMOC")) {
            self.order = hdr0.get("HPXMOC");
          } else if (hdr0.contains("MOCORDER")) {
            self.order = hdr0.get("MOCORDER");
          } else if (hdr1.contains("HPXMOC")) {
            self.order = hdr1.get("HPXMOC");
          } else if (hdr1.contains("MOCORDER")) {
            self.order = hdr1.get("MOCORDER");
          } else {
            console.error("Can not find MOC order in FITS file");
            return;
          }

          var data = this.getDataUnit(1);
          var colName = data.columns[0];
          data.getRows(0, data.rows, function (rows) {
            for (var k = 0; k < rows.length; k++) {
              var uniq = rows[k][colName];
              var order = Math.floor(Math.floor(log2(Math.floor(uniq / 4))) / 2);
              var ipix = uniq - 4 * Math.pow(4, order);

              self._addPix(order, ipix);
            }
          });
          data = null; // this helps releasing memory

          self._removeDuplicatesFromIndexes();

          if (successCallback) {
            successCallback();
          }

          self.reportChange();
          self.ready = true;
        }; // end of callback function

        this.dataURL = mocURL; // instantiate the FITS object which will fetch the URL passed as parameter

        new astro.FITS(this.dataURL, callback);
      };

      MOC.prototype.setView = function (view) {
        this.view = view;
        this.reportChange();
      };

      MOC.prototype.draw = function (ctx, projection, viewFrame, width, height, largestDim, zoomFactor, fov) {
        if (!this.isShowing || !this.ready) {
          return;
        }

        var mocCells = fov > MOC.PIVOT_FOV && this.adaptativeDisplay ? this._lowResIndexOrder3 : this._highResIndexOrder3;

        this._drawCells(ctx, mocCells, fov, projection, viewFrame, CooFrameEnum.J2000, width, height, largestDim, zoomFactor);
      };

      MOC.prototype._drawCells = functyon (ctx, mocCellsIdxOrder3, fov, projection, viewFrame, surveyFrame, width, height, largestDim, zoomFactor) {
        ctx.lineWidth = this.lineWidth; // if opacity==1, we draw solid lines, else we fill each HEALPix cell

        if (this.opacity == 1) {
          ctx.strokeStyle = this.color;
        } else {
          ctx.fillStyle = this.color;
          ctx.globalAlpha = this.opacity;
        }

        ctx.beginPath();
        var orderedKeys = [];

        for (var k = 0; k < 768; k++) {
          var mocCells = mocCellsIdxOrder3[k];

          for (var key in mocCells) {
            orderedKeys.push(parseInt(key));
          }
        }

        orderedKeys.sort(function (a, b) {
          return a - b;
        });
        var norderMax = orderedKeys[orderedKeys.length - 1];
        var nside, xyCorners, ipix;
        var potentialVisibleHpxCellsOrder3 = this.view.getVisiblePixList(3);
        var visibleHpxCellsOrder3 = []; // let's test first all potential visible cells and keep only the one with a projection inside the view

        for (var k = 0; k < potentialVisibleHpxCellsOrder3.length; k++) {
          var ipix = potentialVisibleHpxCellsOrder3[k];
          xyCorners = getXYCorners(8, ipix, viewFrame, surveyFrame, width, height, largestDim, zoomFactor, projection, this.view);

          if (xyCorners) {
            visibleHpxCellsOrder3.push(ipix);
          }
        }

        var counter = 0;
        var mocCells;
        var norder3Ipix;

        for (var norder = 0; norder <= norderMax; norder++) {
          nside = 1 << norder;

          for (var i = 0; i < visibleHpxCellsOrder3.length; i++) {
            var ipixOrder3 = visibleHpxCellsOrder3[i];
            mocCells = mocCellsIdxOrder3[ipixOrder3];

            if (typeof mocCells[norder] === "undefined") {
              continue;
            }

            if (norder <= 3) {
              for (var j = 0; j < mocCells[norder].length; j++) {
                ipix = mocCells[norder][j];
                var factor = Math.pow(4, 3 - norder);
                var startIpix = ipix * factor;

                for (var k = 0; k < factor; k++) {
                  norder3Ipix = startIpix + k;
                  xyCorners = getXYCorners(8, norder3Ipix, viewFrame, surveyFrame, width, height, largestDim, zoomFactor, projection, this.view);

                  if (xyCorners) {
                    drawCorners(ctx, xyCorners);
                  }
                }
              }
            } else {
              for (var j = 0; j < mocCells[norder].length; j++) {
                ipix = mocCells[norder][j];
                var parentIpixOrder3 = Math.floor(ipix / Math.pow(4, norder - 3));
                xyCorners = getXYCorners(nside, ipix, viewFrame, surveyFrame, width, height, largestDim, zoomFactor, projection, this.view);

                if (xyCorners) {
                  drawCorners(ctx, xyCorners);
                }
              }
            }
          }
        }

        if (this.opacity == 1) {
          ctx.stroke();
        } else {
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      };

      var drawCorners = function drawCorners(ctx, xyCorners) {
        ctx.moveTo(xyCorners[0].vx, xyCorners[0].vy);
        ctx.lineTo(xyCorners[1].vx, xyCorners[1].vy);
        ctx.lineTo(xyCorners[2].vx, xyCorners[2].vy);
        ctx.lineTo(xyCorners[3].vx, xyCorners[3].vy);
        ctx.lineTo(xyCorners[0].vx, xyCorners[0].vy);
      }; // remove duplicate items from array a

      var uniq = function uniq(a) {
        var seen = {};
        var out = [];
        var len = a.length;
        var j = 0;

        for (var i = 0; i < len; i++) {
          var item = a[i];

          if (seen[item] !== 1) {
            seen[item] = 1;
            out[j++] = item;
          }
        }

        return out;
      }; // TODO: merge with what is done in View.getVisibleCells
      //var _spVec = new SpatialVector();

      var getXYCorners = function getXYCorners(nside, ipix, viewFrame, surveyFrame, width, height, largestDim, zoomFactor, projection, view) {
        var cornersXYView = [];
        var cornersXY = []; //var spVec = _spVec;

        var corners = view.aladin.webglAPI.hpxNestedVertices(Math.log2(nside), ipix);
        var ra, dec;
        var lon, lat;

        for (var k = 0; k < 4; k++) {
          //spVec.setXYZ(corners[k].x, corners[k].y, corners[k].z);
          ra = corners[2 * k];
          dec = corners[2 * k + 1]; // need for frame transformation ?

          /*if (surveyFrame && surveyFrame.system != viewFrame.system) {
          if (surveyFrame.system == CooFrameEnum.SYSTEMS.J2000) {
              var radec = CooConversion.J2000ToGalactic([ra, dec]);
              lon = radec[0];
              lat = radec[1];
          }
          else if (surveyFrame.system == CooFrameEnum.SYSTEMS.GAL) {
              var radec = CooConversion.GalacticToJ2000([ra, dec]);
              lon = radec[0];
              lat = radec[1];
          }
      }
      else {
          lon = ra;
          lat = dec;
      }*/

          lon = ra;
          lat = dec; //cornersXY[k] = projection.project(lon, lat);

          cornersXYView[k] = view.aladin.webglAPI.worldToScreen(lon, lat);

          if (!cornersXYView[k]) {
            return null;
          } else {
            //console.log(lon, lat);
            cornersXYView[k] = {
              vx: cornersXYView[k][0],
              vy: cornersXYView[k][1],
            };
          } //console.log(cornersXYView[k]);
        }
        /*if (cornersXYView[0] == null ||  cornersXYView[1] == null  ||  cornersXYView[2] == null ||  cornersXYView[3] == null ) {
        return null;
    }*/

        /*if (cornersXY[0] == null ||  cornersXY[1] == null  ||  cornersXY[2] == null ||  cornersXY[3] == null ) {
        return null;
    }
     for (var k=0; k<4; k++) {
        cornersXYView[k] = AladinUtils.xyToView(cornersXY[k].X, cornersXY[k].Y, width, height, largestDim, zoomFactor);
    }*/
        // detect pixels outside view. Could be improved !
        // we minimize here the number of cells returned

        if (cornersXYView[0].vx < 0 && cornersXYView[1].vx < 0 && cornersXYView[2].vx < 0 && cornersXYView[3].vx < 0) {
          return null;
        }

        if (cornersXYView[0].vy < 0 && cornersXYView[1].vy < 0 && cornersXYView[2].vy < 0 && cornersXYView[3].vy < 0) {
          return null;
        }

        if (cornersXYView[0].vx >= width && cornersXYView[1].vx >= width && cornersXYView[2].vx >= width && cornersXYView[3].vx >= width) {
          return null;
        }

        if (cornersXYView[0].vy >= height && cornersXYView[1].vy >= height && cornersXYView[2].vy >= height && cornersXYView[3].vy >= height) {
          return null;
        } // check if we have a pixel at the edge of the view in allsky projections
        //if (projection.PROJECTION!=ProjectionEnum.SIN && projection.PROJECTION!=ProjectionEnum.TAN) {
        // Faster approach: when a vertex from a cell gets to the other side of the projection
        // its vertices order change from counter-clockwise to clockwise!
        // So if the vertices describing a cell are given in clockwise order
        // we know it crosses the projection, so we do not plot them!

        if (
          !AladinUtils.counterClockwiseTriangle(
            cornersXYView[0].vx,
            cornersXYView[0].vy,
            cornersXYView[1].vx,
            cornersXYView[1].vy,
            cornersXYView[2].vx,
            cornersXYView[2].vy
          ) ||
          !AladinUtils.counterClockwiseTriangle(
            cornersXYView[0].vx,
            cornersXYView[0].vy,
            cornersXYView[2].vx,
            cornersXYView[2].vy,
            cornersXYView[3].vx,
            cornersXYView[3].vy
          )
        ) {
          return null;
        } //}
        //cornersXYView = AladinUtils.grow2(cornersXYView, 1);

        return cornersXYView;
      };

      MOC.prototype.reportChange = function () {
        this.view && this.view.requestRedraw();
      };

      MOC.prototype.show = function () {
        if (this.isShowing) {
          return;
        }

        this.isShowing = true;
        this.reportChange();
      };

      MOC.prototype.hide = function () {
        if (!this.isShowing) {
          return;
        }

        this.isShowing = false;
        this.reportChange();
      }; // Tests whether a given (ra, dec) point on the sky is within the current MOC object
      //
      // returns true if point is contained, false otherwise

      MOC.prototype.contains = function (ra, dec) {
        var hpxIdx = new HealpixIndex(Math.pow(2, this.order));
        hpxIdx.init();
        var polar = HealpixIndex.utils.radecToPolar(ra, dec);
        var ipix = hpxIdx.ang2pix_nest(polar.theta, polar.phi);
        var ipixMapByOrder = {};

        for (var curOrder = 0; curOrder <= this.order; curOrder++) {
          ipixMapByOrder[curOrder] = Math.floor(ipix / Math.pow(4, this.order - curOrder));
        } // first look for large HEALPix cells (order<3)

        for (var ipixOrder3 = 0; ipixOrder3 < 768; ipixOrder3++) {
          var mocCells = this._highResIndexOrder3[ipixOrder3];

          for (var order in mocCells) {
            if (order < 3) {
              for (var k = mocCells[order].length; k >= 0; k--) {
                if (ipixMapByOrder[order] == mocCells[order][k]) {
                  return true;
                }
              }
            }
          }
        } // look for finer cells

        var ipixOrder3 = ipixMapByOrder[3];
        var mocCells = this._highResIndexOrder3[ipixOrder3];

        for (var order in mocCells) {
          for (var k = mocCells[order].length; k >= 0; k--) {
            if (ipixMapByOrder[order] == mocCells[order][k]) {
              return true;
            }
          }
        }

        return false;
      };

      return MOC;
    })(); // CONCATENATED MODULE: ./src/js/Line.js
    // Copyright 2015 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * Class Line
     *
     * A line is a graphical overlay connecting 2 points
     *
     * Author: Matthieu Baumann[CDS]
     *
     *****************************************************************************/
    var Line = (function () {
      // constructor
      var Line = function Line(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
      }; // Method for testing whether a line is inside the view
      // http://www.jeffreythompson.org/collision-detection/line-rect.php

      Line.prototype.isInsideView = function (rw, rh) {
        if (this.x1 >= 0 && this.x1 <= rw && this.y1 >= 0 && this.y1 <= rh) {
          return true;
        }

        if (this.x2 >= 0 && this.x2 <= rw && this.y2 >= 0 && this.y2 <= rh) {
          return true;
        } // check if the line has hit any of the rectangle's sides
        // uses the Line/Line function below

        var left = Line.intersectLine(this.x1, this.y1, this.x2, this.y2, 0, 0, 0, rh);
        var right = Line.intersectLine(this.x1, this.y1, this.x2, this.y2, rw, 0, rw, rh);
        var top = Line.intersectLine(this.x1, this.y1, this.x2, this.y2, 0, 0, rw, 0);
        var bottom = Line.intersectLine(this.x1, this.y1, this.x2, this.y2, 0, rh, rw, rh); // if ANY of the above are true, the line
        // has hit the rectangle

        if (left || right || top || bottom) {
          return true;
        }

        return false;
      };

      Line.prototype.draw = function (ctx) {
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
      };

      Line.intersectLine = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        // Calculate the direction of the lines
        var uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        var uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)); // If uA and uB are between 0-1, lines are colliding

        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
          return true;
        }

        return false;
      };

      return Line;
    })(); // CONCATENATED MODULE: ./src/js/Overlay.js
    // Copyright 2015 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File Overlay
     *
     * Description: a plane holding overlays (footprints, polylines, circles)
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var Overlay_Overlay = (function () {
      var Overlay = function Overlay(options) {
        options = options || {};
        this.uuid = Utils.uuidv4();
        this.type = "overlay";
        this.name = options.name || "overlay";
        this.color = options.color || Color.getNextColor();
        this.lineWidth = options["lineWidth"] || 2; //this.indexationNorder = 5; // at which level should we index overlays?

        this.overlays = [];
        this.overlay_items = []; // currently Circle or Polyline
        //this.hpxIdx = new HealpixIndex(this.indexationNorder);
        //this.hpxIdx.init();

        this.isShowing = true;
      }; // TODO : show/hide methods should be integrated in a parent class

      Overlay.prototype.show = function () {
        if (this.isShowing) {
          return;
        }

        this.isShowing = true;
        this.reportChange();
      };

      Overlay.prototype.hide = function () {
        if (!this.isShowing) {
          return;
        }

        this.isShowing = false;
        this.reportChange();
      }; // return an array of Footprint from a STC-S string

      Overlay.parseSTCS = function (stcs) {
        var footprints = [];
        var parts = stcs.match(/\S+/g);
        var k = 0,
          len = parts.length;

        while (k < len) {
          var s = parts[k].toLowerCase();

          if (s == "polygon") {
            var curPolygon = [];
            k++;
            frame = parts[k].toLowerCase();

            if (frame == "icrs" || frame == "j2000" || frame == "fk5") {
              while (k + 2 < len) {
                var ra = parseFloat(parts[k + 1]);

                if (isNaN(ra)) {
                  break;
                }

                var7dec = parseFloat(parts[k + 2]);
                curPolygon.push([ra, dec]);
                k += 2;
              }

              curPolygon.push(curPolygon[0]);
              footprints.push(new Footprint(curPolygon));
            }
          } else if (s == "circle") {
            var frame;
            k++;
            frame = parts[k].toLowerCase();

            if (frame == "icrs" || frame == "j2000" || frame == "fk5") {
              var ra, dec, radiusDegrees;
              ra = parseFloat(parts[k + 1]);
              dec = parseFloat(parts[k + 2]);
              radiusDegrees = parseFloat(parts[k + 3]);
              footprints.push(A.circle(ra, dec, radiusDegrees));
              k += 3;
            }
          }

          k++;
        }

        return footprints;
      }; // ajout d'un tableau d'overlays (= objets Footprint, Circle ou Polyline)

      Overlay.prototype.addFootprints = function (overlaysToAdd) {
        for (var k = 0, len = overlaysToAdd.length; k < len; k++) {
          this.add(overlaysToAdd[k], false);
        }

        this.view.requestRedraw();
      }; // TODO : item doit pouvoir prendre n'importe quoi en param (footprint, circle, polyline)

      Overlay.prototype.add = function (item, requestRedraw) {
        requestRedraw = requestRedraw !== undefined ? requestRedraw : true;

        if (item instanceof Footprint) {
          this.overlays.push(item);
        } else {
          this.overlay_items.push(item);
        }

        item.setOverlay(this);

        if (requestRedraw) {
          this.view.requestRedraw();
        }
      }; // return a footprint by index

      Overlay.prototype.getFootprint = function (idx) {
        if (idx < this.footprints.length) {
          return this.footprints[idx];
        } else {
          return null;
        }
      };

      Overlay.prototype.setView = function (view) {
        this.view = view;
      };

      Overlay.prototype.removeAll = function () {
        // TODO : RAZ de l'index
        this.overlays = [];
        this.overlay_items = [];
      };

      Overlay.prototype.draw = function (ctx, projection, frame, width, height, largestDim, zoomFactor) {
        if (!this.isShowing) {
          return;
        } // simple drawing

        ctx.strokeStyle = this.color; // 1. Drawing polygons
        // TODO: les overlay polygons devrait se tracer lui meme (methode draw)

        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        var xyviews = [];

        for (var k = 0, len = this.overlays.length; k < len; k++) {
          xyviews.push(this.drawFootprint(this.overlays[k], ctx, projection, frame, width, height, largestDim, zoomFactor));
        }

        ctx.stroke(); // selection drawing

        ctx.strokeStyle = Overlay.increaseBrightness(this.color, 50);
        ctx.beginPath();

        for (var k = 0, len = this.overlays.length; k < len; k++) {
          if (!this.overlays[k].isSelected) {
            continue;
          }

          this.drawFootprintSelected(ctx, xyviews[k]);
        }

        ctx.stroke(); // 2. Circle and polylines drawing

        for (var k = 0; k < this.overlay_items.length; k++) {
          this.overlay_items[k].draw(ctx, this.view, projection, frame, width, height, largestDim, zoomFactor);
        }
      };

      Overlay.increaseBrightness = function (hex, percent) {
        // strip the leading # if it's there
        hex = hex.replace(/^\s*#|\s*$/g, ""); // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`

        if (hex.length == 3) {
          hex = hex.replace(/(.)/g, "$1$1");
        }

        var r = parseInt(hex.substr(0, 2), 16),
          g = parseInt(hex.substr(2, 2), 16),
          b = parseInt(hex.substr(4, 2), 16);
        return (
          "#" +
          (0 | ((1 << 8) + r + ((256 - r) * percent) / 100)).toString(16).substr(1) +
          (0 | ((1 << 8) + g + ((256 - g) * percent) / 100)).toString(16).substr(1) +
          (0 | ((1 << 8) + b + ((256 - b) * percent) / 100)).toString(16).substr(1)
        );
      };

      Overlay.prototype.drawFootprint = function (f, ctx, projection, frame, width, height, largestDim, zoomFactor) {
        if (!f.isShowing) {
          return null;
        }

        var xyviewArray = [];
        var show = false;

        var radecArray = f.polygons;

        for (var l = 0; l < radecArray.length - 1; l++) {
          if (frame.system != CooFrameEnum.SYSTEMS.J2000) {
            var lonlat_1 = CooConversion.J2000ToGalactic([radecArray[l][0], radecArray[l][1]]);
            var lonlat_2 = CooConversion.J2000ToGalactic([radecArray[l + 1][0], radecArray[l + 1][1]]);
            var pts = this.view.aladin.webglAPI.projectLine(lonlat_1[0], lonlat_1[1], lonlat_2[0], lonlat_2[1]);
            xyviewArray.push(pts);
          } else {
            var pts = this.view.aladin.webglAPI.projectLine(radecArray[l][0], radecArray[l][1], radecArray[l + 1][0], radecArray[l + 1][1]);
            xyviewArray.push(pts);
          }

          for (var k = 0; k < pts.length; k += 4) {
            var line = new Line(pts[k], pts[k + 1], pts[k + 2], pts[k + 3]);

            if (line.isInsideView(width, height)) {
              line.draw(ctx);
            }
          }
        } // for

        return xyviewArray;
      };

      Overlay.prototype.drawFootprintSelected = function (ctx, xyview) {
        if (!xyview) {
          return;
        }
        // var baseColor = ctx.strokeStyle;

        try {
          for (var k = 0; k < xyview.length; k++) {
            for (var i = 0; i < xyview[k].length; i += 4) {
              var line = new Line(xyview[k][i], xyview[k][i + 1], xyview[k][i + 2], xyview[k][i + 3]);
              ctx.lineWidth = 3;
              line.draw(ctx);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }; // callback function to be called when the status of one of the footprints has changed

      Overlay.prototype.reportChange = function () {
        this.view.requestRedraw();
      };

      return Overlay;
    })(); // CONCATENATED MODULE: ./src/js/Ellipse.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File Ellipse
     *
     * Author: Matthieu Baumann[CDS]
     *
     *****************************************************************************/

    // TODO : Ellipse, Circle and Footprint should inherit from the same root object

    var Ellipse = (function () {
      // constructor
      var Ellipse = function Ellipse(centerRaDec, rayonXDegrees, rayonYDegrees, rotationDegrees, options) {
        options = options || {};
        this.color = options["color"] || undefined; // TODO : all graphic overlays should have an id

        this.id = "ellipse-" + Utils.uuidv4();
        this.setCenter(centerRaDec);
        this.setRadiuses(rayonXDegrees, rayonYDegrees);
        this.setRotation(rotationDegrees);
        this.overlay = null;
        this.isShowing = true;
        this.isSelected = false;
      };

      Ellipse.prototype.setOverlay = function (overlay) {
        this.overlay = overlay;
      };

      Ellipse.prototype.show = function () {
        if (this.isShowing) {
          return;
        }

        this.isShowing = true;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Ellipse.prototype.hide = function () {
        if (!this.isShowing) {
          return;
        }

        this.isShowing = false;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Ellipse.prototype.dispatchClickEvent = function () {
        if (this.overlay) {
          // footprint selection code adapted from Fabrizio Giordano dev. from Serco for ESA/ESDC
          //window.dispatchEvent(new CustomEvent("footprintClicked", {
          this.overlay.view.aladinDiv.dispatchEvent(
            new CustomEvent("footprintClicked", {
              detail: {
                footprintId: this.id,
                overlayName: this.overlay.name,
              },
            })
          );
        }
      };

      Ellipse.prototype.select = function () {
        if (this.isSelected) {
          return;
        }

        this.isSelected = true;

        if (this.overlay) {
          /*
                  this.overlay.view.aladinDiv.dispatchEvent(new CustomEvent("footprintClicked", {
                      detail: {
                          footprintId: this.id,
                          overlayName: this.overlay.name
                      }
                  }));
      */
          this.overlay.reportChange();
        }
      };

      Ellipse.prototype.deselect = function () {
        if (!this.isSelected) {
          return;
        }

        this.isSelected = false;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Ellipse.prototype.setCenter = function (centerRaDec) {
        this.centerRaDec = centerRaDec;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Ellipse.prototype.setRotation = function (rotationDegrees) {
        // radians
        var theta = (rotationDegrees * Math.PI) / 180;
        this.rotation = theta; // rotation in clockwise in the 2d canvas
        // we must transform it so that it is a north to east rotation
        //this.rotation = -theta - Math.PI/2;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Ellipse.prototype.setRadiuses = function (radiusXDegrees, radiusYDegrees) {
        this.radiusXDegrees = radiusXDegrees;
        this.radiusYDegrees = radiusYDegrees;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      }; // TODO

      Ellipse.prototype.draw = function (ctx, view, projection, frame, width, height, largestDim, zoomFactor, noStroke) {
        if (!this.isShowing) {
          return;
        }

        noStroke = noStroke === true || false;
        var centerXyview = AladinUtils.radecToViewXy(this.centerRaDec[0], this.centerRaDec[1], view);

        if (!centerXyview) {
          // the center goes out of the projection
          // we do not draw it
          return;
        }

        var circlePtXyViewRa = AladinUtils.radecToViewXy(this.centerRaDec[0] + this.radiusXDegrees, this.centerRaDec[1], view);
        var circlePtXyViewDec = AladinUtils.radecToViewXy(this.centerRaDec[0], this.centerRaDec[1] + this.radiusYDegrees, view);

        if (!circlePtXyViewRa || !circlePtXyViewDec) {
          // the circle border goes out of the projection
          // we do not draw it
          return;
        }

        var dxRa = circlePtXyViewRa[0] - centerXyview[0];
        var dyRa = circlePtXyViewRa[1] - centerXyview[1];
        var radiusInPixX = Math.sqrt(dxRa * dxRa + dyRa * dyRa);
        var dxDec = circlePtXyViewDec[0] - centerXyview[0];
        var dyDec = circlePtXyViewDec[1] - centerXyview[1];
        var radiusInPixY = Math.sqrt(dxDec * dxDec + dyDec * dyDec); // Ellipse crossing the projection

        if (dxRa * dyDec - dxDec * dyRa <= 0.0) {
          // We do not draw it
          return;
        } // TODO : check each 4 point until show

        var baseColor = this.color;

        if (!baseColor && this.overlay) {
          baseColor = this.overlay.color;
        }

        if (!baseColor) {
          baseColor = "#ff0000";
        }
        // var originLinewidth;

        if (this.isSelected) {
          // ctx.strokeStyle = Overlay.increaseBrightness(baseColor, 50);
          // originLinewidth = this.overlay.lineWidth;
          // this.overlay.lineWidth += 3;
          ctx.strokeStyle = baseColor;
        } else {
          ctx.strokeStyle = baseColor;
          // if (originLinewidth) this.overlay.lineWidth = originLinewidth;
        } // 1. Find the spherical tangent vector going to the north

        var origin = this.centerRaDec;
        var toNorth = [this.centerRaDec[0], this.centerRaDec[1] + 1e-3]; // 2. Project it to the screen

        var originScreen = this.overlay.view.aladin.webglAPI.worldToScreen(origin[0], origin[1]);
        var toNorthScreen = this.overlay.view.aladin.webglAPI.worldToScreen(toNorth[0], toNorth[1]); // 3. normalize this vector

        var toNorthVec = [toNorthScreen[0] - originScreen[0], toNorthScreen[1] - originScreen[1]];
        var norm = Math.sqrt(toNorthVec[0] * toNorthVec[0] + toNorthVec[1] * toNorthVec[1]);
        toNorthVec = [toNorthVec[0] / norm, toNorthVec[1] / norm];
        var toWestVec = [1.0, 0.0];
        var x1 = toWestVec[0];
        var y1 = toWestVec[1];
        var x2 = toNorthVec[0];
        var y2 = toNorthVec[1]; // 4. Compute the west to north angle

        var westToNorthAngle = Math.atan2(x1 * y2 - y1 * x2, x1 * x2 + y1 * y2); // 5. Get the correct ellipse angle

        var theta = -this.rotation + westToNorthAngle;
        ctx.beginPath();
        ctx.ellipse(centerXyview[0], centerXyview[1], radiusInPixX, radiusInPixY, theta, 0, 2 * Math.PI, false);

        if (!noStroke) {
          ctx.stroke();
        }
      };

      return Ellipse;
    })(); // CONCATENATED MODULE: ./src/js/Polyline.js
    // Copyright 2015 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * Class Polyline
     *
     * A Polyline is a graphical overlay made of several connected points
     *
     * TODO: Polyline and Circle should derive from a common base class
     * TODO: index polyline, Circle in HEALPix pixels to avoid unneeded calls to draw
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var Polyline = (function () {
      // constructor
      var Polyline = function Polyline(radecArray, options) {
        options = options || {};
        this.color = options["color"] || undefined;
        this.radecArray = radecArray;
        this.overlay = null;
        this.isShowing = true;
        this.isSelected = false;
      };

      Polyline.prototype.setOverlay = function (overlay) {
        this.overlay = overlay;
      };

      Polyline.prototype.show = function () {
        if (this.isShowing) {
          return;
        }

        this.isShowing = true;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Polyline.prototype.hide = function () {
        if (!this.isShowing) {
          return;
        }

        this.isShowing = false;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Polyline.prototype.select = function () {
        if (this.isSelected) {
          return;
        }

        this.isSelected = true;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Polyline.prototype.deselect = function () {
        if (!this.isSelected) {
          return;
        }

        this.isSelected = false;

        if (this.overlay) {
          this.overlay.reportChange();
        }
      };

      Polyline.prototype.draw = function (ctx, view, projection, frame, width, height, largestDim, zoomFactor) {
        if (!this.isShowing) {
          return;
        }

        if (!this.radecArray || this.radecArray.length < 2) {
          return;
        }

        if (this.color) {
          ctx.strokeStyle = this.color;
        }
        /*var start = AladinUtils.radecToViewXy(this.radecArray[0][0], this.radecArray[0][1], projection, frame, width, height, largestDim, zoomFactor);
    if (! start) {
        return;
    }
            ctx.beginPath();
    ctx.moveTo(start.vx, start.vy);
    var pt;
    for (var k=1; k<this.radecArray.length; k++) {
        pt = AladinUtils.radecToViewXy(this.radecArray[k][0], this.radecArray[k][1], projection, frame, width, height, largestDim, zoomFactor);
        if (!pt) {
            break;
        }
        ctx.lineTo(pt.vx, pt.vy);
    }
    
    
    ctx.stroke();*/

        ctx.beginPath();

        var pts;
        for (var l = 0; l < this.radecArray.length - 1; l++) {
          if (frame.system != CooFrameEnum.SYSTEMS.J2000) {
            var lonlat_1 = CooConversion.J2000ToGalactic([this.radecArray[l][0], this.radecArray[l][1]]);
            var lonlat_2 = CooConversion.J2000ToGalactic([this.radecArray[l + 1][0], this.radecArray[l + 1][1]]);
            pts = view.aladin.webglAPI.projectLine(lonlat_1[0], lonlat_1[1], lonlat_2[0], lonlat_2[1]);
          } else {
            pts = view.aladin.webglAPI.projectLine(
              this.radecArray[l][0],
              this.radecArray[l][1],
              this.radecArray[l + 1][0],
              this.radecArray[l + 1][1]
            );
          }

          for (var k = 0; k < pts.length; k += 4) {
            var line = new Line(pts[k], pts[k + 1], pts[k + 2], pts[k + 3]);

            if (line.isInsideView(width, height)) {
              line.draw(ctx);
            }
          }
        }

        ctx.stroke();
      };

      return Polyline;
    })(); // CONCATENATED MODULE: ./src/js/Source.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File Source
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/
    var Source = (function () {
      // constructor
      var Source = function Source(ra, dec, data, options) {
        this.ra = ra;
        this.dec = dec;
        this.data = data;
        this.catalog = null;
        this.marker = (options && options.marker) || false;

        if (this.marker) {
          this.popupTitle = options && options.popupTitle ? options.popupTitle : "";
          this.popupDesc = options && options.popupDesc ? options.popupDesc : "";
          this.useMarkerDefaultIcon = options && options.useMarkerDefaultIcon !== undefined ? options.useMarkerDefaultIcon : true;
        }

        this.isShowing = true;
        this.isSelected = false;
      };

      Source.prototype.setCatalog = function (catalog) {
        this.catalog = catalog;
      };

      Source.prototype.show = function () {
        if (this.isShowing) {
          return;
        }

        this.isShowing = true;

        if (this.catalog) {
          this.catalog.reportChange();
        }
      };

      Source.prototype.hide = function () {
        if (!this.isShowing) {
          return;
        }

        this.isShowing = false;

        if (this.catalog) {
          this.catalog.reportChange();
        }
      };

      Source.prototype.select = function () {
        if (this.isSelected) {
          return;
        }

        this.isSelected = true;

        if (this.catalog) {
          this.catalog.reportChange();
        }
      };

      Source.prototype.deselect = function () {
        if (!this.isSelected) {
          return;
        }

        this.isSelected = false;

        if (this.catalog) {
          this.catalog.reportChange();
        }
      }; // function called when a source is clicked. Called by the View object

      Source.prototype.actionClicked = function () {
        if (this.catalog && this.catalog.onClick) {
          var view = this.catalog.view;

          if (this.catalog.onClick == "showTable") {
            view.aladin.measurementTable.showMeasurement(this);
            this.select();
          } else if (this.catalog.onClick == "showPopup") {
            view.popup.setTitle("<br><br>");
            var m = '<div class="aladin-marker-measurement">';
            m += "<table>";

            for (var key in this.data) {
              m += "<tr><td>" + key + "</td><td>" + this.data[key] + "</td></tr>";
            }

            m += "</table>";
            m += "</div>";
            view.popup.setText(m);
            view.popup.setSource(this);
            view.popup.show();
          } else if (typeof this.catalog.onClick === "function") {
            this.catalog.onClick(this);
            view.lastClickedObject = this;
          }
        }
      };

      Source.prototype.actionOtherObjectClicked = function () {
        if (this.catalog && this.catalog.onClick) {
          this.deselect();
        }
      };

      return Source;
    })(); // CONCATENATED MODULE: ./src/js/Catalog.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File Catalog
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    //import { HealpixIndex }   from "./libs/healpix.js";

    // TODO : harmoniser parsing avec classe ProgressiveCat

    var Catalog = (function () {
      function Catalog(options) {
        options = options || {};
        this.uuid = Utils.uuidv4();
        this.type = "catalog";
        this.name = options.name || "catalog";
        this.color = options.color || Color_Color.getNextColor();
        this.sourceSize = options.sourceSize || 8;
        this.markerSize = options.sourceSize || 12;
        this.shape = options.shape || "square";
        console.log("shape", options);

        this.maxNbSources = options.limit || undefined;
        this.onClick = options.onClick || undefined;
        this.raField = options.raField || undefined; // ID or name of the field holding RA

        this.decField = options.decField || undefined; // ID or name of the field holding dec

        this.indexationNorder = 5; // à quel niveau indexe-t-on les sources

        this.sources = []; //this.hpxIdx = new HealpixIndex(this.indexationNorder);
        //this.hpxIdx.init();

        this.displayLabel = options.displayLabel || false;
        this.labelColor = options.labelColor || this.color;
        this.labelFont = options.labelFont || "10px sans-serif";

        if (this.displayLabel) {
          this.labelColumn = options.labelColumn;

          if (!this.labelColumn) {
            this.displayLabel = false;
          }
        }

        if (this.shape instanceof Image || this.shape instanceof HTMLCanvasElement) {
          this.sourceSize = this.shape.width;
        }

        this._shapeIsFunction = false; // if true, the shape is a function drawing on the canvas

        if ($.isFunction(this.shape)) {
          this._shapeIsFunction = true;
        }

        this.selectionColor = "#00ff00"; // create this.cacheCanvas
        // cacheCanvas permet de ne créer le path de la source qu'une fois, et de le réutiliser (cf. http://simonsarris.com/blog/427-increasing-performance-by-caching-paths-on-canvas)

        this.updateShape(options);
        this.cacheMarkerCanvas = document.createElement("canvas");
        this.cacheMarkerCanvas.width = this.markerSize;
        this.cacheMarkerCanvas.height = this.markerSize;
        var cacheMarkerCtx = this.cacheMarkerCanvas.getContext("2d");
        cacheMarkerCtx.fillStyle = this.color;
        cacheMarkerCtx.beginPath();
        var half = this.markerSize / 2;
        cacheMarkerCtx.arc(half, half, half - 2, 0, 2 * Math.PI, false);
        cacheMarkerCtx.fill();
        cacheMarkerCtx.lineWidth = 2;
        cacheMarkerCtx.strokeStyle = "#ccc";
        cacheMarkerCtx.stroke();
        this.isShowing = true;
      }

      Catalog.createShape = function (shapeName, color, sourceSize) {
        if (shapeName instanceof Image || shapeName instanceof HTMLCanvasElement) {
          // in this case, the shape is already created
          return shapeName;
        }

        var c = document.createElement("canvas");
        c.width = c.height = sourceSize;
        var ctx = c.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.0;

        if (shapeName == "plus") {
          ctx.moveTo(sourceSize / 2, 0);
          ctx.lineTo(sourceSize / 2, sourceSize);
          ctx.stroke();
          ctx.moveTo(0, sourceSize / 2);
          ctx.lineTo(sourceSize, sourceSize / 2);
          ctx.stroke();
        } else if (shapeName == "cross") {
          ctx.moveTo(0, 0);
          ctx.lineTo(sourceSize - 1, sourceSize - 1);
          ctx.stroke();
          ctx.moveTo(sourceSize - 1, 0);
          ctx.lineTo(0, sourceSize - 1);
          ctx.stroke();
        } else if (shapeName == "rhomb") {
          ctx.moveTo(sourceSize / 2, 0);
          ctx.lineTo(0, sourceSize / 2);
          ctx.lineTo(sourceSize / 2, sourceSize);
          ctx.lineTo(sourceSize, sourceSize / 2);
          ctx.lineTo(sourceSize / 2, 0);
          ctx.stroke();
        } else if (shapeName == "triangle") {
          ctx.moveTo(sourceSize / 2, 0);
          ctx.lineTo(0, sourceSize - 1);
          ctx.lineTo(sourceSize - 1, sourceSize - 1);
          ctx.lineTo(sourceSize / 2, 0);
          ctx.stroke();
        } else if (shapeName == "circle") {
          // sourceSize = 100;
          ctx.arc(sourceSize / 2, sourceSize / 2, sourceSize / 2 - 1, 0, 2 * Math.PI, true);
          ctx.stroke();
        } else {
          // default shape: square
          ctx.moveTo(1, 0);
          ctx.lineTo(1, sourceSize - 1);
          ctx.lineTo(sourceSize - 1, sourceSize - 1);
          ctx.lineTo(sourceSize - 1, 1);
          ctx.lineTo(1, 1);
          ctx.stroke();
        }

        return c;
      }; // find RA, Dec fields among the given fields
      //
      // @param fields: list of objects with ucd, unit, ID, name attributes
      // @param raField:  index or name of right ascension column (might be undefined)
      // @param decField: index or name of declination column (might be undefined)
      //

      function findRADecFields(fields, raField, decField) {
        var raFieldIdx, decFieldIdx;
        raFieldIdx = decFieldIdx = null; // first, look if RA/DEC fields have been already given

        if (raField) {
          // ID or name of RA field given at catalogue creation
          for (var l = 0, len = fields.length; l < len; l++) {
            var field = fields[l];

            if (Utils.isInt(raField) && raField < fields.length) {
              // raField can be given as an index
              raFieldIdx = raField;
              break;
            }

            if ((field.ID && field.ID === raField) || (field.name && field.name === raField)) {
              raFieldIdx = l;
              break;
            }
          }
        }

        if (decField) {
          // ID4or name of dec field given at catalogue creation
          for (var l = 0, len = fields.length; l < len; l++) {
            var field = fields[l];

            if (Utils.isInt(decField) && decField < fields.length) {
              // decField can be given as an index
              decFieldIdx = decField;
              break;
            }

            if ((field.ID && field.ID === decField) || (field.name && field.name === decField)) {
              decFieldIdx = l;
              break;
            }
          }
        } // if not already given, let's guess position columns on the basis of UCDs

        for (var l = 0, len = fields.length; l < len; l++) {
          if (raFieldIdx != null && decFieldIdx != null) {
            break;
          }

          var field = fields[l];

          if (!raFieldIdx) {
            if (field.ucd) {
              var ucd = $.trim(field.ucd.toLowerCase());

              if (ucd.indexOf("pos.eq.ra") == 0 || ucd.indexOf("pos_eq_ra") == 0) {
                raFieldIdx = l;
                continue;
              }
            }
          }

          if (!decFieldIdx) {
            if (field.ucd) {
              var ucd = $.trim(field.ucd.toLowerCase());

              if (ucd.indexOf("pos.eq.dec") == 0 || ucd.indexOf("pos_eq_dec") == 0) {
                decFieldIdx = l;
                continue;
              }
            }
          }
        } // still not found ? try some common names for RA and Dec columns

        if (raFieldIdx == null && decFieldIdx == null) {
          for (var l = 0, len = fields.length; l < len; l++) {
            var field = fields[l];
            var name = field.name || field.ID || "";
            name = name.toLowerCase();

            if (!raFieldIdx) {
              if (
                name.indexOf("ra") == 0 ||
                name.indexOf("_ra") == 0 ||
                name.indexOf("ra(icrs)") == 0 ||
                name.indexOf("_ra") == 0 ||
                name.indexOf("alpha") == 0
              ) {
                raFieldIdx = l;
                continue;
              }
            }

            if (!decFieldIdx) {
              if (
                name.indexOf("dej2000") == 0 ||
                name.indexOf("_dej2000") == 0 ||
                name.indexOf("de") == 0 ||
                name.indexOf("de(icrs)") == 0 ||
                name.indexOf("_de") == 0 ||
                name.indexOf("delta") == 0
              ) {
                decFieldIdx = l;
                continue;
              }
            }
          }
        } // last resort: take two first fieds

        if (raFieldIdx == null || decFieldIdx == null) {
          raFieldIdx = 0;
          decFieldIdx = 1;
        }

        return [raFieldIdx, decFieldIdx];
      } // return an array of Source(s) from a VOTable url

      // callback function is called each time a TABLE element has been parsed

      Catalog.parseVOTable = function (url, callback, maxNbSources, useProxy, raField, decField) {
        // adapted from votable.js
        function getPrefix($xml) {
          var prefix; // If Webkit chrome/safari/... (no need prefix)

          if ($xml.find("RESOURCE").length > 0) {
            prefix = "";
          } else {
            // Select all data in the document
            prefix = $xml.find("*").first();

            if (prefix.length == 0) {
              return "";
            } // get name of the first tag

            prefix = prefix.prop("tagName");
            var idx = prefix.indexOf(":");
            prefix = prefix.substring(0, idx) + "\\:";
          }

          return prefix;
        }

        function doParseVOTable(xml, callback) {
          xml = xml.replace(/^\s+/g, ""); // we need to trim whitespaces at start of document

          var attributes = ["name", "ID", "ucd", "utype", "unit", "datatype", "arraysize", "width", "precision"];
          var fields = [];
          var k = 0;
          var $xml = $($.parseXML(xml));
          var prefix = getPrefix($xml);
          $xml.find(prefix + "FIELD").each(function () {
            var f = {};

            for (var i = 0; i < attributes.length; i++) {
              var attribute = attributes[i];

              if ($(this).attr(attribute)) {
                f[attribute] = $(this).attr(attribute);
              }
            }

            if (!f.ID) {
              f.ID = "col_" + k;
            }

            fields.push(f);
            k++;
          });
          var raDecFieldIdxes = findRADecFields(fields, raField, decField);
          var raFieldIdx, decFieldIdx;
          raFieldIdx = raDecFieldIdxes[0];
          decFieldIdx = raDecFieldIdxes[1];
          var sources = [];
          var coo = new coo_Coo();
          var ra, dec;
          $xml.find(prefix + "TR").each(function () {
            var mesures = {};
            var k = 0;
            $(this)
              .find(prefix + "TD")
              .each(function () {
                var key = fields[k].name ? fields[k].name : fields[k].id;
                mesures[key] = $(this).text();
                k++;
              });
            var keyRa = fields[raFieldIdx].name ? fields[raFieldIdx].name : fields[raFieldIdx].id;
            var keyDec = fields[decFieldIdx].name ? fields[decFieldIdx].name : fields[decFieldIdx].id;

            if (Utils.isNumber(mesures[keyRa]) && Utils.isNumber(mesures[keyDec])) {
              ra = parseFloat(mesures[keyRa]);
              dec = parseFloat(mesures[keyDec]);
            } else {
              coo.parse(mesures[keyRa] + " " + mesures[keyDec]);
              ra = coo.lon;
              dec = coo.lat;
            }

            sources.push(new Source(ra, dec, mesures));

            if (maxNbSources && sources.length == maxNbSources) {
              return false; // break the .each loop
            }
          });

          if (callback) {
            callback(sources);
          }
        }

        var ajax = Utils.getAjaxObject(url, "GET", "text", useProxy);
        ajax.done(function (xml) {
          doParseVOTable(xml, callback);
        });
      }; // API

      Catalog.prototype.updateShape = function (options) {
        options = options || {};
        this.color = options.color || this.color || Color_Color.getNextColor();
        this.sourceSize = options.sourceSize || this.sourceSize || 6;
        this.shape = options.shape || this.shape || "square";
        this.selectSize = this.sourceSize + 2;
        this.cacheCanvas = Catalog.createShape(this.shape, this.color, this.sourceSize);
        this.cacheSelectCanvas = Catalog.createShape("square", this.selectionColor, this.selectSize);
        this.reportChange();
      }; // API

      Catalog.prototype.addSources = function (sourcesToAdd) {
        sourcesToAdd = [].concat(sourcesToAdd); // make sure we have an array and not an individual source

        this.sources = this.sources.concat(sourcesToAdd);

        for (var k = 0, len = sourcesToAdd.length; k < len; k++) {
          sourcesToAdd[k].setCatalog(this);
        }

        this.reportChange();
      }; // API
      //
      // create sources from a 2d array and add them to the catalog
      //
      // @param columnNames: array with names of the columns
      // @array: 2D-array, each item being a 1d-array with the same number of items as columnNames

      Catalog.prototype.addSourcesAsArray = function (columnNames, array) {
        var fields = [];

        for (var colIdx = 0; colIdx < columnNames.length; colIdx++) {
          fields.push({
            name: columnNames[colIdx],
          });
        }

        var raDecFieldIdxes = findRADecFields(fields, this.raField, this.decField);
        var raFieldIdx, decFieldIdx;
        raFieldIdx = raDecFieldIdxes[0];
        decFieldIdx = raDecFieldIdxes[1];
        var newSources = [];
        var coo = new coo_Coo();
        var ra, dec, row, dataDict;

        for (var rowIdx = 0; rowIdx < array.length; rowIdx++) {
          row = array[rowIdx];

          if (Utils.isNumber(row[raFieldIdx]) && Utils.isNumber(row[decFieldIdx])) {
            ra = parseFloat(row[raFieldIdx]);
            dec = parseFloat(row[decFieldIdx]);
          } else {
            coo.parse(row[raFieldIdx] + " " + row[decFieldIdx]);
            ra = coo.lon;
            dec = coo.lat;
          }

          dataDict = {};

          for (var colIdx = 0; colIdx < columnNames.length; colIdx++) {
            dataDict[columnNames[colIdx]] = row[colIdx];
          }

          newSources.push(A.source(ra, dec, dataDict));
        }

        this.addSources(newSources);
      }; // return the current list of Source objects

      Catalog.prototype.getSources = function () {
        return this.sources;
      }; // TODO : fonction générique traversant la liste des sources

      Catalog.prototype.selectAll = function () {
        if (!this.sources) {
          return;
        }

        for (var k = 0; k < this.sources.length; k++) {
          this.sources[k].select();
        }
      };

      Catalog.prototype.deselectAll = function () {
        if (!this.sources) {
          return;
        }

        for (var k = 0; k < this.sources.length; k++) {
          this.sources[k].deselect();
        }
      }; // return a source by index

      Catalog.prototype.getSource = function (idx) {
        if (idx < this.sources.length) {
          return this.sources[idx];
        } else {
          return null;
        }
      };

      Catalog.prototype.setView = function (view) {
        this.view = view;
        this.reportChange();
      }; // remove a source

      Catalog.prototype.remove = function (source) {
        var idx = this.sources.indexOf(source);

        if (idx < 0) {
          return;
        }

        this.sources[idx].deselect();
        this.sources.splice(idx, 1);
        this.reportChange();
      };

      Catalog.prototype.removeAll = Catalog.prototype.clear = function () {
        // TODO : RAZ de l'index
        this.sources = [];
      };

      Catalog.prototype.draw = function (ctx, projection, frame, width, height, largestDim, zoomFactor) {
        if (!this.isShowing) {
          return;
        } // tracé simple
        //ctx.strokeStyle= this.color;
        //ctx.lineWidth = 1;
        //ctx.beginPath();

        if (this._shapeIsFunction) {
          ctx.save();
        }
        /*var sourcesInView = [];
    for (var k=0, len = this.sources.length; k<len; k++) {
    var inView = Catalog.drawSource(this, this.sources[k], ctx, projection, frame, width, height, largestDim, zoomFactor);
        if (inView) {
            sourcesInView.push(this.sources[k]);
        }
    }*/

        var sourcesInView = Catalog.drawSources(this, this.sources, ctx, width, height);

        if (this._shapeIsFunction) {
          ctx.restore();
        } //ctx.stroke();
        // tracé sélection

        ctx.strokeStyle = this.selectionColor; //ctx.beginPath();

        var source;

        for (var k = 0, len = sourcesInView.length; k < len; k++) {
          source = sourcesInView[k];

          if (!source.isSelected) {
            continue;
          }

          Catalog.drawSourceSelection(this, source, ctx);
        } // NEEDED ?
        //ctx.stroke();
        // tracé label

        if (this.displayLabel) {
          ctx.fillStyle = thij.labelColor;
          ctx.font = this.labelFont;

          for (var k = 0, len = sourcesInView.length; k < len; k++) {
            Catalog.drawSourceLabel(this, sourcesInView[k], ctx);
          }
        }
      };

      Catalog.drawSources = function (catalogInstance, sources, ctx, width, height) {
        /*if (!s.isShowing) {
        return;
    }*/
        var sourceSize = catalogInstance.sourceSize; //console.log('COMPUTE', aladin.webglAPI.worldToScreen(s.ra, s.dec));
        //console.log(sources)

        var radec = [];
        sources.forEach(function (s) {
          radec.push({
            ra: s.ra,
            dec: s.dec,
          });
        });
        var sourcesXY = catalogInstance.view.aladin.webglAPI.worldToScreenVec(radec);
        var sourcesInView = [];
        /*
    // TODO : we could factorize this code with Aladin.world2pix
    var xy;
    if (frame.system != CooFrameEnum.SYSTEMS.J2000) {
        var lonlat = CooConversion.J2000ToGalactic([s.ra, s.dec]);
        xy = projection.project(lonlat[0], lonlat[1]);
    }
    else {
        xy = projection.project(s.ra, s.dec);
    }
    */

        for (var i = 0; i < sources.length; i++) {
          var xy = [sourcesXY[2 * i], sourcesXY[2 * i + 1]];

          if (xy[0] != -1 && xy[1] != -1) {
            var s = sources[i]; //var xyview = AladinUtils.xyToView(xy.X, xy.Y, width, height, largestDim, zoomFactor, true);

            var xyview = {
              vx: xy[0],
              vy: xy[1],
            };
            var max = s.popup ? 100 : s.sourceSize;

            if (xyview) {
              // TODO : index sources by HEALPix cells at level 3, 4 ?
              // check if source is visible in view
              if (xyview.vx > width + max || xyview.vx < 0 - max || xyview.vy > height + max || xyview.vy < 0 - max) {
                s.x = s.y = undefined;
              } else {
                s.x = xyview.vx;
                s.y = xyview.vy;

                if (catalogInstance._shapeIsFunction) {
                  catalogInstance.shape(s, ctx, catalogInstance.view.getViewParams());
                } else if (s.marker && s.useMarkerDefaultIcon) {
                  ctx.drawImage(catalogInstance.cacheMarkerCanvas, s.x - sourceSize / 2, s.y - sourceSize / 2);
                } else {
                  ctx.drawImage(
                    catalogInstance.cacheCanvas,
                    s.x - catalogInstance.cacheCanvas.width / 2,
                    s.y - catalogInstance.cacheCanvas.height / 2
                  );
                } // has associated popup ?

                if (s.popup) {
                  s.popup.setPosition(s.x, s.y);
                }
              }
            }

            sourcesInView.push(s);
          }
        }

        return sourcesInView;
      };

      Catalog.drawSource = function (catalogInstance, s, ctx, width, height) {
        if (!s.isShowing) {
          return false;
        }
        // console.log("catalogInstance", catalogInstance);

        var sourceSize = catalogInstance.sourceSize; //console.log('COMPUTE', aladin.webglAPI.worldToScreen(s.ra, s.dec));

        var xy = catalogInstance.view.aladin.webglAPI.worldToScreen(s.ra, s.dec);
        /*
    // TODO : we could factorize this code with Aladin.world2pix
    var xy;
    if (frame.system != CooFrameEnum.SYSTEMS.J2000) {
        var lonlat = CooConversion.J2000ToGalactic([s.ra, s.dec]);
        xy = projection.project(lonlat[0], lonlat[1]);
    }
    else {
        xy = projection.project(s.ra, s.dec);
    }
    */

        if (xy) {
          //var xyview = AladinUtils.xyToView(xy.X, xy.Y, width, height, largestDim, zoomFactor, true);
          var xyview = {
            vx: xy[0],
            vy: xy[1],
          };
          var max = s.popup ? 100 : s.sourceSize;

          if (xyview) {
            // TODO : index sources by HEALPix cells at level 3, 4 ?
            // check if source is visible in view
            if (xyview.vx > width + max || xyview.vx < 0 - max || xyview.vy > height + max || xyview.vy < 0 - max) {
              s.x = s.y = undefined;
              return false;
            }

            s.x = xyview.vx;
            s.y = xyview.vy;

            if (catalogInstance._shapeIsFunction) {
              // console.log("color", catalogInstance.color);
              catalogInstance.shape(s, ctx, catalogInstance.view.getViewParams(), catalogInstance.color);
            } else if (s.marker && s.useMarkerDefaultIcon) {
              // console.log("shape is not function");
              ctx.drawImage(catalogInstance.cacheMarkerCanvas, s.x - sourceSize / 2, s.y - sourceSize / 2);
            } else {
              // console.log("shape is not function too");
              ctx.drawImage(catalogInstance.cacheCanvas, s.x - catalogInstance.cacheCanvas.width / 2, s.y - catalogInstance.cacheCanvas.height / 2);
            } // has associated popup ?

            if (s.popup) {
              s.popup.setPosition(s.x, s.y);
            }
          }

          return true;
        } else {
          return false;
        }
      };

      Catalog.drawSourceSelection = function (catalogInstance, s, ctx) {
        if (!s || !s.isShowing || !s.x || !s.y) {
          return;
        }

        var sourceSize = catalogInstance.selectSize;
        ctx.drawImage(catalogInstance.cacheSelectCanvas, s.x - sourceSize / 2, s.y - sourceSize / 2);
      };

      Catalog.drawSourceLabel = function (catalogInstance, s, ctx) {
        if (!s || !s.isShowing || !s.x || !s.y) {
          return;
        }

        var label = s.data[catalogInstance.labelColumn];

        if (!label) {
          return;
        }

        ctx.fillText(label, s.x, s.y);
      }; // callback function to be called when the status of one of the sources has changed

      Catalog.prototype.reportChange = function () {
        this.view && this.view.requestRedraw();
      };

      Catalog.prototype.show = function () {
        if (this.isShowing) {
          return;
        }

        this.isShowing = true;
        this.reportChange();
      };

      Catalog.prototype.hide = function () {
        if (!this.isShowing) {
          return;
        }

        this.isShowing = false;

        if (this.view && this.view.popup && this.view.popup.source && this.view.popup.source.catalog == this) {
          this.view.popup.hide();
        }

        this.reportChange();
      };

      return Catalog;
    })(); // CONCATENATED MODULE: ./src/js/ProgressiveCat.js
    function ProgressiveCat_defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true,
        });
      } else {
        obj[key] = value;
      }
      return obj;
    }

    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File ProgressiveCat.js
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    // TODO: index sources according to their HEALPix ipix
    // TODO : merge parsing with class Catalog

    var ProgressiveCat = (function () {
      // TODO : test if CORS support. If no, need to pass through a proxy
      // currently, we suppose CORS is supported
      // constructor
      var ProgressiveCat = function ProgressiveCat(rootUrl, frameStr, maxOrder, options) {
        options = options || {};
        this.uuid = Utils.uuidv4();
        this.type = "progressivecat";
        this.rootUrl = rootUrl; // TODO: method to sanitize rootURL (absolute, no duplicate slashes, remove end slash if existing)
        // fast fix for HTTPS support --> will work for all HiPS served by CDS

        if (Utils.isHttpsContext() && (/u-strasbg.fr/i.test(this.rootUrl) || /unistra.fr/i.test(this.rootUrl))) {
          this.rootUrl = this.rootUrl.replace("http://", "https://");
        }

        this.frameStr = frameStr;
        this.frame = CooFrameEnum.fromString(frameStr) || CooFrameEnum.J2000;
        this.maxOrder = maxOrder;
        this.isShowing = true; // TODO : inherit from catalogue

        this.name = options.name || "progressive-cat";
        this.color = options.color || Color_Color.getNextColor();
        this.shape = options.shape || "square";

        this._shapeIsFunction = false; // if true, the shape is a function drawing on the canvas

        if ($.isFunction(this.shape)) {
          this._shapeIsFunction = true;
        }
        // console.log("shape", this.shape);

        this.sourceSize = options.sourceSize || 6;
        this.selectSize = this.sourceSize + 2;
        this.selectionColor = "#00ff00"; // TODO: to be merged with Catalog
        // allows for filtering of sources

        this.filterFn = options.filter || undefined; // TODO: do the same for catalog

        this.onClick = options.onClick || undefined; // TODO: inherit from catalog
        // we cache the list of sources in each healpix tile. Key of the cache is norder+'-'+npix

        this.sourcesCache = new Utils.LRUCache(256);
        this.updateShape(options);
        this.maxOrderAllsky = 2;
        this.isReady = false;
      }; // TODO: to be put higher in the class diagram, in a HiPS generic class

      ProgressiveCat.readProperties = function (rootUrl, successCallback, errorCallback) {
        if (!successCallback) {
          return;
        }

        var propertiesURL = rootUrl + "/properties";
        $.ajax({
          url: propertiesURL,
          method: "GET",
          dataType: "text",
          success: function success(propertiesTxt) {
            var props = {};
            var lines = propertiesTxt.split("\n");

            for (var k = 0; k < lines.length; k++) {
              var line = lines[k];
              var idx = line.indexOf("=");
              var propName = $.trim(line.substring(0, idx));
              var propValue = $.trim(line.substring(idx + 1));
              props[propName] = propValue;
            }

            successCallback(props);
          },
          error: function error(err) {
            // TODO : which parameters should we put in the error callback
            errorCallback && errorCallback(err);
          },
        });
      };

      function getFields(instance, xml) {
        var attributes = ["name", "ID", "ucd", "utype", "unit", "datatype", "arraysize", "width", "precision"];
        var fields = [];
        var k = 0;
        instance.keyRa = instance.keyDec = null;
        $(xml)
          .find("FIELD")
          .each(function () {
            var f = {};

            for (var i = 0; i < attributes.length; i++) {
              var attribute = attributes[i];

              if ($(this).attr(attribute)) {
                f[attribute] = $(this).attr(attribute);
              }
            }

            if (!f.ID) {
              f.ID = "col_" + k;
            }

            if (!instance.keyRa && f.ucd && (f.ucd.indexOf("pos.eq.ra") == 0 || f.ucd.indexOf("POS_EQ_RA") == 0)) {
              if (f.name) {
                instance.keyRa = f.name;
              } else {
                instance.keyRa = f.ID;
              }
            }

            if (!instance.keyDec && f.ucd && (f.ucd.indexOf("pos.eq.dec") == 0 || f.ucd.indexOf("POS_EQ_DEC") == 0)) {
              if (f.name) {
                instance.keyDec = f.name;
              } else {
                instance.keyDec = f.ID;
              }
            }

            fields.push(f);
            k++;
          });
        return fields;
      }

      function getSources(instance, csv, fields) {
        // TODO : find ra and dec key names (see in Catalog)
        if (!instance.keyRa || !instance.keyDec) {
          return [];
        }

        var lines = csv.split("\n");
        var mesureKeys = [];

        for (var k = 0; k < fields.length; k++) {
          if (fields[k].name) {
            mesureKeys.push(fields[k].name);
          } else {
            mesureKeys.push(fields[k].ID);
          }
        }

        var sources = [];
        var coo = new coo_Coo();
        var newSource; // start at i=1, as first line repeat the fields names

        for (var i = 2; i < lines.length; i++) {
          var mesures = {};
          var data = lines[i].split("\t");

          if (data.length < mesureKeys.length) {
            continue;
          }

          for (var j = 0; j < mesureKeys.length; j++) {
            mesures[mesureKeys[j]] = data[j];
          }

          var ra, dec;

          if (Utils.isNumber(mesures[instance.keyRa]) && Utils.isNumber(mesures[instance.keyDec])) {
            ra = parseFloat(mesures[instance.keyRa]);
            dec = parseFloat(mesures[instance.keyDec]);
          } else {
            coo.parse(mesures[instance.keyRa] + " " + mesures[instance.keyDec]);
            ra = coo.lon;
            dec = coo.lat;
          }

          newSource = new Source(ra, dec, mesures);
          sources.push(newSource);
          newSource.setCatalog(instance);
        }

        return sources;
      } //ProgressiveCat.prototype.updateShape = Catalog.prototype.updateShape;

      ProgressiveCat.prototype = ProgressiveCat_defineProperty(
        {
          init: function init(view) {
            var self = this;
            this.view = view;

            if (this.maxOrder && this.frameStr) {
              this._loadMetadata();
            } else {
              ProgressiveCat.readProperties(
                self.rootUrl,
                function (properties) {
                  self.properties = properties;
                  self.maxOrder = self.properties["hips_order"];
                  self.frame = CooFrameEnum.fromString(self.properties["hips_frame"]);

                  self._loadMetadata();
                },
                function (err) {
                  console.log("Could not find properties for HiPS " + self.rootUrl);
                }
              );
            }
          },
          updateShape: Catalog.prototype.updateShape,
          _loadMetadata: function _loadMetadata() {
            var self = this;
            $.ajax({
              url: self.rootUrl + "/" + "Metadata.xml",
              method: "GET",
              success: function success(xml) {
                self.fields = getFields(self, xml);

                self._loadAllskyNewMethod();
              },
              error: function error(err) {
                self._loadAllskyOldMethod();
              },
            });
          },
          _loadAllskyNewMethod: function _loadAllskyNewMethod() {
            var self = this;
            $.ajax({
              url: self.rootUrl + "/" + "Norder1/Allsky.tsv",
              method: "GET",
              success: function success(tsv) {
                self.order1Sources = getSources(self, tsv, self.fields);

                if (self.order2Sources) {
                  self.isReady = true;

                  self._finishInitWhenReady();
                }
              },
              error: function error(err) {
                console.log("Something went wrong in load all sky norder1 allsky: " + err);
              },
            });
            $.ajax({
              url: self.rootUrl + "/" + "Norder2/Allsky.tsv",
              method: "GET",
              success: function success(tsv) {
                self.order2Sources = getSources(self, tsv, self.fields);

                if (self.order1Sources) {
                  self.isReady = true;

                  self._finishInitWhenReady();
                }
              },
              error: function error(err) {
                console.log("Something went wrong in load all sky norder2 allsky: " + err);
              },
            });
          },
          _loadAllskyOldMethod: function _loadAllskyOldMethod() {
            this.maxOrderAllsky = 3;

            this._loadLevel2Sources();

            this._loadLevel3Sources();
          },
          _loadLevel2Sources: function _loadLevel2Sources() {
            var self = this;
            $.ajax({
              url: self.rootUrl + "/" + "Norder2/Allsky.xml",
              method: "GET",
              success: function success(xml) {
                self.fields = getFields(self, xml);
                self.order2Sources = getSources(self, $(xml).find("CSV").text(), self.fields);

                if (self.order3Sources) {
                  self.isReady = true;

                  self._finishInitWhenReady();
                }
              },
              error: function error(err) {
                console.log("Something went wrong in loading norder2 allsky xml: " + err);
              },
            });
          },
          _loadLevel3Sources: function _loadLevel3Sources() {
            var self = this;
            $.ajax({
              url: self.rootUrl + "/" + "Norder3/Allsky.xml",
              method: "GET",
              success: function success(xml) {
                self.order3Sources = getSources(self, $(xml).find("CSV").text(), self.fields);

                if (self.order2Sources) {
                  self.isReady = true;

                  self._finishInitWhenReady();
                }
              },
              error: function error(err) {
                console.log("Something went wrong in loading norder3 allsky xml: " + err);
              },
            });
          },
          _finishInitWhenReady: function _finishInitWhenReady() {
            this.view.requestRedraw();
            this.loadNeededTiles();
          },
          draw: function draw(ctx, projection, frame, width, height, largestDim, zoomFactor) {
            if (!this.isShowing || !this.isReady) {
              return;
            }

            this.drawSources(this.order1Sources, ctx, width, height);
            this.drawSources(this.order2Sources, ctx, width, height);
            this.drawSources(this.order3Sources, ctx, width, height);

            if (!this.tilesInView) {
              return;
            }

            var sources, key, t;

            for (var k = 0; k < this.tilesInView.length; k++) {
              t = this.tilesInView[k];
              key = t[0] + "-" + t[1];
              sources = this.sourcesCache.get(key);

              if (sources) {
                this.drawSources(sources, ctx, width, height);
              }
            }
          },
          drawSources: function drawSources(sources, ctx, width, height) {
            if (!sources) {
              return;
            }

            var s;

            for (var k = 0, len = sources.length; k < len; k++) {
              s = sources[k];

              if (!this.filterFn || this.filterFn(s)) {
                // console.log("here");
                Catalog.drawSource(this, s, ctx, width, height);
              }
            }

            var s;

            for (var k = 0, len = sources.length; k < len; k++) {
              s = sources[k];

              if (!s.isSelected) {
                continue;
              }

              if (!this.filterFn || this.filterFn(s)) {
                Catalog.drawSourceSelection(this, s, ctx);
              }
            }
          },
          getSources: function getSources() {
            var ret = [];

            if (this.order1Sources) {
              ret = ret.concat(this.order1Sources);
            }

            if (this.order2Sources) {
              ret = ret.concat(this.order2Sources);
            }

            if (this.order3Sources) {
              ret = ret.concat(this.order3Sources);
            }

            if (this.tilesInView) {
              var sources, key, t;

              for (var k = 0; k < this.tilesInView.length; k++) {
                t = this.tilesInView[k];
                key = t[0] + "-" + t[1];
                sources = this.sourcesCache.get(key);

                if (sources) {
                  ret = ret.concat(sources);
                }
              }
            }

            return ret;
          },
          deselectAll: function deselectAll() {
            if (this.order1Sources) {
              for (var k = 0; k < this.order1Sources.length; k++) {
                this.order1Sources[k].deselect();
              }
            }

            if (this.order2Sources) {
              for (var k = 0; k < this.order2Sources.length; k++) {
                this.order2Sources[k].deselect();
              }
            }

            if (this.order3Sources) {
              for (var k = 0; k < this.order3Sources.length; k++) {
                this.order3Sources[k].deselect();
              }
            }

            var keys = this.sourcesCache.keys();

            for (key in keys) {
              if (!this.sourcesCache[key]) {
                continue;
              }

              var sources = this.sourcesCache[key];

              for (var k = 0; k < sources.length; k++) {
                sources[k].deselect();
              }
            }
          },
          show: function show() {
            if (this.isShowing) {
              return;
            }

            this.isShowing = true;
            this.loadNeededTiles();
            this.reportChange();
          },
          hide: function hide() {
            if (!this.isShowing) {
              return;
            }

            this.isShowing = false;
            this.reportChange();
          },
          reportChange: function reportChange() {
            this.view.requestRedraw();
          },
          getTileURL: function getTileURL(norder, npix) {
            var dirIdx = Math.floor(npix / 10000) * 10000;
            return this.rootUrl + "/" + "Norder" + norder + "/Dir" + dirIdx + "/Npix" + npix + ".tsv";
          },
          loadNeededTiles: function loadNeededTiles() {
            if (!this.isShowing) {
              return;
            }

            this.tilesInView = [];
            var norder = this.view.realNorder;

            if (norder > this.maxOrder) {
              norder = this.maxOrder;
            }

            if (norder <= this.maxOrderAllsky) {
              return; // nothing to do, hurrayh !
            }

            var cells = this.view.getVisibleCells(norder);
            var ipixList, ipix;

            for (var curOrder = 3; curOrder <= norder; curOrder++) {
              ipixList = [];

              for (var k = 0; k < cells.length; k++) {
                ipix = Math.floor(cells[k].ipix / Math.pow(4, norder - curOrder));

                if (ipixList.indexOf(ipix) < 0) {
                  ipixList.push(ipix);
                }
              } // load needed tiles

              for (var i = 0; i < ipixList.length; i++) {
                this.tilesInView.push([curOrder, ipixList[i]]);
              }
            }

            var t, key;
            var self = this;

            for (var k = 0; k < this.tilesInView.length; k++) {
              t = this.tilesInView[k];
              key = t[0] + "-" + t[1]; // t[0] is norder, t[1] is ipix

              if (!this.sourcesCache.get(key)) {
                (function (self, norder, ipix) {
                  // wrapping function is needed to be able to retrieve norder and ipix in ajax success function
                  var key = norder + "-" + ipix;
                  $.ajax({
                    /*
              url: Aladin.JSONP_PROXY,
              data: {"url": self.getTileURL(norder, ipix)},
              */
                    // ATTENTIOn : je passe en JSON direct, car je n'arrive pas a choper les 404 en JSONP
                    url: self.getTileURL(norder, ipix),
                    method: "GET",
                    //dataType: 'jsonp',
                    success: function success(tsv) {
                      self.sourcesCache.set(key, getSources(self, tsv, self.fields));
                      self.view.requestRedraw();
                    },
                    error: function error() {
                      // on suppose qu'il s'agit d'une erreur 404
                      self.sourcesCache.set(key, []);
                    },
                  });
                })(this, t[0], t[1]);
              }
            }
          },
        },
        "reportChange",
        function reportChange() {
          // TODO: to be shared with Catalog
          this.view && this.view.requestRedraw();
        }
      ); // END OF .prototype functions

      return ProgressiveCat;
    })(); // CONCATENATED MODULE: ./src/js/Sesame.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File Sesame.js
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var Sesame = (function () {
      var Sesame = {};
      Sesame.cache = {};
      Sesame.SESAME_URL = "http://cds.u-strasbg.fr/cgi-bin/nph-sesame.jsonp";
      /** find RA, DEC for any target (object name or position)
       *  if successful, callback is called with an object {ra: <ra-value>, dec: <dec-value>}
       *  if not successful, errorCallback is called
       */

      Sesame.getTargetRADec = function (target, callback, errorCallback) {
        if (!callback) {
          return;
        }

        var isObjectName = /[a-zA-Z]/.test(target); // try to parse as a position

        if (!isObjectName) {
          var coo = new Coo();
          coo.parse(target);

          if (callback) {
            callback({
              ra: coo.lon,
              dec: coo.lat,
            });
          }
        } // ask resolution by Sesame
        else {
          Sesame.resolve(
            target,
            function (data) {
              // success callback
              callback({
                ra: data.Target.Resolver.jradeg,
                dec: data.Target.Resolver.jdedeg,
              });
            },
            function (data) {
              // error callback
              if (errorCallback) {
                errorCallback();
              }
            }
          );
        }
      };

      Sesame.resolve = function (objectName, callbackFunctionSuccess, callbackFunctionError) {
        var sesameUrl = Sesame.SESAME_URL;

        if (Utils.isHttpsContext()) {
          sesameUrl = sesameUrl.replace("http://", "https://");
        }

        $.ajax({
          url: sesameUrl,
          data: {
            object: objectName,
          },
          method: "GET",
          dataType: "jsonp",
          success: function success(data) {
            if (data.Target && data.Target.Resolver && data.Target.Resolver) {
              callbackFunctionSuccess(data);
            } else {
              callbackFunctionError(data);
            }
          },
          error: callbackFunctionError,
        });
      };

      return Sesame;
    })(); // CONCATENATED MODULE: ./src/js/MeasurementTable.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File MeasurementTable
     *
     * Graphic object showing measurement of a catalog
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/
    var MeasurementTable = (function () {
      // constructor
      function MeasurementTable(aladinLiteDiv) {
        this.isShowing = false;
        this.divEl = $('<div class="aladin-measurement-div"></div>');
        $(aladinLiteDiv).append(this.divEl);
      } // show measurement associated with a given source

      MeasurementTable.prototype.showMeasurement = function (source) {
        this.divEl.empty();
        var header = "<thead><tr>";
        var content = "<tr>";

        for (var key in source.data) {
          header += "<th>" + key + "</th>";
          content += "<td>" + source.data[key] + "</td>";
        }

        header += "</tr></thead>";
        content += "</tr>";
        this.divEl.append("<table>" + header + content + "</table>");
        this.show();
      };

      MeasurementTable.prototype.show = function () {
        this.divEl.show();
      };

      MeasurementTable.prototype.hide = function () {
        this.divEl.hide();
      };

      return MeasurementTable;
    })(); // CONCATENATED MODULE: ./src/js/Location.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File Location.js
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var Location = (function () {
      // constructor
      function Location(locationDiv) {
        this.$div = $(locationDiv);
      }

      Location.prototype.update = function (lon, lat, cooFrame, isViewCenterPosition) {
        var coo = new coo_Coo(lon, lat, 7);

        if (cooFrame == CooFrameEnum.J2000) {
          this.$div.html(coo.format("s/"));
        } else if (cooFrame == CooFrameEnum.J2000d) {
          this.$div.html(coo.format("d/"));
        } else {
          this.$div.html(coo.format("d/"));
        }

        this.$div.toggleClass("aladin-reticleColor", isViewCenterPosition);
      };

      return Location;
    })(); // CONCATENATED MODULE: ./src/js/HiPSDefinition.js
    // Copyright 2013-2017 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File HiPSDefinition
     *
     * Author: Thomas Boch [CDS]
     *
     *****************************************************************************/

    var HiPSDefinition = (function () {
      // constructor
      function HiPSDefinition(properties) {
        this.properties = properties; // key-value object corresponding to the properties file

        this.id = this.getID();
        this.obsTitle = properties["obs_title"];
        this.frame = properties["hips_frame"];
        this.order = parseInt(properties["hips_order"]);
        this.clientSortKey = properties["client_sort_key"];
        this.tileFormats = properties.hasOwnProperty("hips_tile_format") && properties["hips_tile_format"].split(" ");
        this.urls = [];
        this.urls.push(properties["hips_service_url"]);
        var k = 1;

        while (properties.hasOwnProperty("hips_service_url_" + k)) {
          this.urls.push(properties["hips_service_url_" + k]);
          k++;
        }

        this.clientApplications = properties["client_application"];
      }

      HiPSDefinition.prototype = {
        getServiceURLs: function getServiceURLs(httpsOnly) {
          httpsOnly = httpsOnly === true; // TODO: TO BE COMPLETED
        },
        // return the ID according to the properties
        getID: function getID() {
          // ID is explicitely given
          if (this.properties.hasOwnProperty("ID")) {
            return this.properties["ID"];
          }

          var id = null; // ID might be built from different fields

          if (this.properties.hasOwnProperty("creator_did")) {
            id = this.properties["creator_did"];
          }

          if (id == null && this.properties.hasOwnProperty("publisher_did")) {
            id = this.properties["publisher_did"];
          }

          if (id != null) {
            // remove ivo:// prefix
            if (id.slice(0, 6) === "ivo://") {
              id = id.slice(6);
            } // '?' are replaced by '/'

            id = id.replace(/\?/g, "/");
          }

          return id;
        },
      }; // cache (at the source code level) of the list of HiPS
      // this is the result to a query to http://alasky.u-strasbg.fr/MocServer/query?dataproduct_type=image&client_application=AladinLite&fmt=json&fields=ID,obs_title,client_sort_key,client_application,hips_service_url*,hips_order,hips_tile_format,hips_frame

      var AL_CACHE_CLASS_LEVEL = [
        /*{
    "ID": "CDS/P/2MASS/color",
    "obs_title": "2MASS color J (1.23 microns), H (1.66 microns), K (2.16 microns)",
    "client_sort_key": "04-001-00",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "9",
    "hips_frame": "equatorial",
    "hips_tile_format": "jpeg",
    "hips_service_url": "http://alasky.unistra.fr/2MASS/Color",
    "hips_service_url_1": "http://alaskybis.unistra.fr/2MASS/Color",
    "hips_service_url_2": "https://alaskybis.unistra.fr/2MASS/Color"
    }, {
    "ID": "CDS/P/AKARI/FIS/Color",
    "obs_title": "AKARI Far-infrared All-Sky Survey - color composition WideL/WideS/N60",
    "client_sort_key": "04-05-00",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "5",
    "hips_frame": "equatorial",
    "hips_tile_format": "png jpeg",
    "hips_service_url": "http://alasky.unistra.fr/AKARI-FIS/ColorLSN60",
    "hips_service_url_1": "http://alaskybis.unistra.fr/AKARI-FIS/ColorLSN60",
    "hips_service_url_2": "https://alaskybis.unistra.fr/AKARI-FIS/ColorLSN60"
    }, {
    "ID": "CDS/P/DECaLS/DR3/color",
    "obs_title": "DECaLS DR3 color",
    "hips_frame": "equatorial",
    "hips_order": "11",
    "hips_tile_format": "jpeg",
    "hips_service_url": "http://alasky.unistra.fr/DECaLS/DR3/color"
    }, {
    "ID": "CDS/P/DSS2/blue",
    "obs_title": "DSS2 Blue (XJ+S)",
    "client_sort_key": "03-01-03",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "9",
    "hips_frame": "equatorial",
    "hips_tile_format": "jpeg fits",
    "hips_service_url": "http://alasky.unistra.fr/DSS/DSS2-blue-XJ-S",
    "hips_service_url_1": "http://alaskybis.unistra.fr/DSS/DSS2-blue-XJ-S",
    "hips_service_url_2": "https://alaskybis.unistra.fr/DSS/DSS2-blue-XJ-S",
    "hips_service_url_3": "http://healpix.ias.u-psud.fr/DSS2Blue"
    }, {
    "ID": "CDS/P/DSS2/color",
    "obs_title": "DSS colored",
    "client_sort_key": "03-00",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "9",
    "hips_frame": "equatorial",
    "hips_tile_format": "jpeg",
    "hips_service_url": "http://alasky.unistra.fr/DSS/DSSColor",
    "hips_service_url_1": "http://alaskybis.unistra.fr/DSS/DSSColor",
    "hips_service_url_2": "https://alaskybis.unistra.fr/DSS/DSSColor",
    "hips_service_url_3": "http://healpix.ias.u-psud.fr/DSSColorNew",
    "hips_service_url_4": "http://skies.esac.esa.int/DSSColor/"
    }, {
    "ID": "CDS/P/DSS2/red",
    "obs_title": "DSS2 Red (F+R)",
    "client_sort_key": "03-01-02",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "9",
    "hips_frame": "equatorial",
    "hips_tile_format": "jpeg fits",
    "hips_service_url": "http://alasky.unistra.fr/DSS/DSS2Merged",
    "hips_service_url_1": "http://alaskybis.unistra.fr/DSS/DSS2Merged",
    "hips_service_url_2": "https://alaskybis.unistra.fr/DSS/DSS2Merged",
    "hips_service_url_3": "http://healpix.ias.u-psud.fr/DSS2Merged"
    }, {
    "ID": "P/PanSTARRS/DR1/g",
    "hips_service_url": "http://alasky.u-strasbg.fr/Pan-STARRS/DR1/g",
    "obs_title": "PanSTARRS DR1 g",
    "hips_order": 11,
    "hips_frame": "equatorial",
    "hips_tile_format": "jpeg fits"
    }, {
    "ID": "CDS/P/Fermi/color",
    "obs_title": "Fermi Color HEALPix survey",
    "client_sort_key": "00-01-01",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "3",
    "hips_frame": "equatorial",
    "hips_tile_format": "jpeg",
    "hips_service_url": "http://alasky.unistra.fr/Fermi/Color",
    "hips_service_url_1": "http://alaskybis.unistra.fr/Fermi/Color",
    "hips_service_url_2": "https://alaskybis.unistra.fr/Fermi/Color"
    }, {
    "ID": "CDS/P/Finkbeiner",
    "obs_title": "Finkbeiner Halpha composite survey",
    "client_sort_key": "06-01",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "3",
    "hips_frame": "galactic",
    "hips_tile_format": "jpeg fits",
    "hips_service_url": "http://alasky.unistra.fr/FinkbeinerHalpha",
    "hips_service_url_1": "http://alaskybis.unistra.fr/FinkbeinerHalpha",
    "hips_service_url_2": "https://alaskybis.unistra.fr/FinkbeinerHalpha"
    }, {
    "ID": "CDS/P/GALEXGR6/AIS/color",
    "obs_title": "GALEX GR6 AIS (until March 2014)- Color composition",
    "client_sort_key": "02-01-01",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "8",
    "hips_frame": "equatorial",
    "hips_tile_format": "png jpeg",
    "hips_service_url": "http://alasky.unistra.fr/GALEX/GR6-03-2014/AIS-Color",
    "hips_service_url_1": "http://alaskybis.unistra.fr/GALEX/GR6-03-2014/AIS-Color",
    "hips_service_url_2": "https://alaskybis.unistra.fr/GALEX/GR6-03-2014/AIS-Color"
    }, {
    "ID": "CDS/P/IRIS/color",
    "obs_title": "IRAS-IRIS HEALPix survey, color",
    "client_sort_key": "04-02-01",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "3",
    "hips_frame": "galactic",
    "hips_tile_format": "jpeg",
    "hips_service_url": "http://alasky.unistra.fr/IRISColor",
    "hips_service_url_1": "http://alaskybis.unistra.fr/IRISColor",
    "hips_service_url_2": "https://alaskybis.unistra.fr/IRISColor",
    "hips_service_url_3": "http://healpix.ias.u-psud.fr/IRISColor",
    "hips_service_url_4": "http://skies.esac.esa.int/IRISColor/"
    }, {
    "ID": "CDS/P/Mellinger/color",
    "obs_title": "Mellinger optical survey, color",
    "client_sort_key": "03-03",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "4",
    "hips_frame": "galactic",
    "hips_tile_format": "jpeg",
    "hips_service_url": "http://alasky.unistra.fr/MellingerRGB",
    "hips_service_url_1": "http://alaskybis.unistra.fr/MellingerRGB",
    "hips_service_url_2": "https://alaskybis.unistra.fr/MellingerRGB"
    }, {
    "ID": "CDS/P/SDSS9/color",
    "obs_title": "SDSS 9 color",
    "client_sort_key": "03-02-01",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "10",
    "hips_frame": "equatorial",
    "hips_tile_format": "jpeg",
    "hips_service_url": "http://alasky.unistra.fr/SDSS/DR9/color",
    "hips_service_url_1": "http://alaskybis.unistra.fr/SDSS/DR9/color",
    "hips_service_url_2": "https://alaskybis.unistra.fr/SDSS/DR9/color",
    "hips_service_url_3": "http://healpix.ias.u-psud.fr/SDSS9Color",
    "hips_service_url_4": "http://skies.esac.esa.int/SDSS9Color/"
    }, {
    "ID": "CDS/P/SPITZER/color",
    "obs_title": "IRAC HEALPix survey, color",
    "client_sort_key": "04-03-00",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "9",
    "hips_frame": "galactic",
    "hips_tile_format": "jpeg",
    "hips_service_url": "http://alasky.unistra.fr/SpitzerI1I2I4color",
    "hips_service_url_1": "http://alaskybis.unistra.fr/SpitzerI1I2I4color",
    "hips_service_url_2": "https://alaskybis.unistra.fr/SpitzerI1I2I4color",
    "hips_service_url_3": "http://healpix.ias.u-psud.fr/SPITZERColor"
    }, {
    "ID": "CDS/P/allWISE/color",
    "obs_title": "AllWISE color  Red (W4) , Green (W2) , Blue (W1) from raw Atlas Images",
    "client_sort_key": "04-003-00",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "8",
    "hips_frame": "equatorial",
    "hips_tile_format": "jpeg",
    "hips_service_url": "http://alasky.unistra.fr/AllWISE/RGB-W4-W2-W1",
    "hips_service_url_1": "http://alaskybis.unistra.fr/AllWISE/RGB-W4-W2-W1",
    "hips_service_url_2": "https://alaskybis.unistra.fr/AllWISE/RGB-W4-W2-W1"
    }, {
    "ID": "IPAC/P/GLIMPSE360",
    "obs_title": "GLIMPSE360: Spitzer's Infrared Milky Way",
    "client_sort_key": "04-03-0",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "9",
    "hips_frame": "equatorial",
    "hips_tile_format": "jpeg",
    "hips_service_url": "http://www.spitzer.caltech.edu/glimpse360/aladin/data"
    }, {
    "ID": "JAXA/P/MAXI_SSC_SUM",
    "hips_tile_format": "png",
    "hips_frame": "equatorial",
    "obs_title": "MAXI SSC all-sky image integrated for 4.5 years",
    "hips_order": "6",
    "hips_service_url": "http://darts.isas.jaxa.jp/pub/judo2/HiPS/maxi_ssc_sum",
    "hips_service_url_1": "http://alasky.unistra.fr//JAXA/JAXA_P_MAXI_SSC_SUM",
    "hips_service_url_2": "http://alaskybis.unistra.fr//JAXA/JAXA_P_MAXI_SSC_SUM",
    "hips_service_url_3": "https://alaskybis.unistra.fr//JAXA/JAXA_P_MAXI_SSC_SUM"
    }, {
    "ID": "JAXA/P/SWIFT_BAT_FLUX",
    "hips_tile_format": "png",
    "hips_frame": "equatorial",
    "obs_title": "Swift-BAT 70-month all-sray hard X-ray survey image",
    "hips_order": "6",
    "hips_service_url": "http://darts.isas.jaxa.jp/pub/judo2/HiPS/swift_bat_flux/",
    "hips_service_url_1": "http://alasky.unistra.fr//JAXA/JAXA_P_SWIFT_BAT_FLUX",
    "hips_service_url_2": "http://alaskybis.unistra.fr//JAXA/JAXA_P_SWIFT_BAT_FLUX",
    "hips_service_url_3": "https://alaskybis.unistra.fr//JAXA/JAXA_P_SWIFT_BAT_FLUX"
    }, {
    "ID": "ov-gso/P/VTSS/Ha",
    "obs_title": "Virginia Tech Spectral-Line Survey (VTSS) - Halpha image",
    "client_sort_key": "06-xx",
    "client_application":[ "AladinLite", "AladinDesktop"],
    "hips_order": "3",
    "hips_frame": ["galactic", "galactic"],
    "hips_tile_format": "png jpeg fits",
    "hips_service_url": "http://cade.irap.omp.eu/documents/Ancillary/4Aladin/VTSS",
    "hips_service_url_1": "http://alasky.unistra.fr/IRAP/VTSS",
    "hips_service_url_2": "http://alaskybis.unistra.fr/IRAP/VTSS",
    "hips_service_url_3": "https://alaskybis.unistra.fr/IRAP/VTSS"
    }, {
    "ID": "xcatdb/P/XMM/EPIC",
    "obs_title": "XMM-Newton stacked EPIC images",
    "hips_frame": "equatorial",
    "hips_order": "7",
    "hips_service_url": "http://saada.u-strasbg.fr/xmmallsky",
    "hips_tile_format": "png fits",
    "hips_service_url_1": "http://alasky.unistra.fr/SSC/xmmallsky",
    "hips_service_url_2": "http://alaskybis.unistra.fr/SSC/xmmallsky",
    "hips_service_url_3": "https://alaskybis.unistra.fr/SSC/xmmallsky"
    }, {
    "ID": "xcatdb/P/XMM/PN/color",
    "obs_title": "False color X-ray images (Red=0.5-1 Green=1-2 Blue=2-4.5)Kev",
    "hips_order": "7",
    "hips_frame": "equatorial",
    "hips_tile_format": "png jpeg",
    "hips_service_url": "http://saada.unistra.fr/PNColor",
    "hips_service_url_1": "http://alasky.u-strasbg.fr/SSC/xcatdb_P_XMM_PN_color",
    "hips_service_url_2": "http://alaskybis.u-strasbg.fr/SSC/xcatdb_P_XMM_PN_color",
    "hips_service_url_3": "https://alaskybis.u-strasbg.fr/SSC/xcatdb_P_XMM_PN_color"
    }
    */
      ];
      var listHipsProperties = []; // this variable stores our current knowledge

      HiPSDefinition.LOCAL_STORAGE_KEY = "aladin:hips-list";
      var RETRIEVAL_TIMESTAMP_KEY = "_timestamp_retrieved";
      var LAST_URL_KEY = "_last_used_url"; // URL previousy used to retrieve data from this HiPS
      // retrieve definitions previousy stored in local storage
      // @return an array with the HiPS definitions, empty array if nothing found or if an error occured

      HiPSDefinition.getLocalStorageDefinitions = function () {
        try {
          var defs = window.localStorage.getItem(HiPSDefinition.LOCAL_STORAGE_KEY);
          return defs === null ? [] : window.JSON.parse(defs);
        } catch (e) {
          // silently fail and return empty array
          return [];
        }
      }; // store in local storage a list of HiPSDefinition objects
      // @return true if storage was successful

      HiPSDefinition.storeInLocalStorage = function (properties) {
        try {
          window.localStorage.setItem(HiPSDefinition.LOCAL_STORAGE_KEY, window.JSON.stringify(properties));
        } catch (e) {
          // silently fail and return false
          return false;
        }

        return true;
      };

      var MOCSERVER_MIRRORS_HTTP = ["http://alasky.u-strasbg.fr/MocServer/query", "http://alaskybis.u-strasbg.fr/MocServer/query"]; // list of base URL for MocServer mirrors, available in HTTP

      var MOCSERVER_MIRRORS_HTTPS = ["https://alasky.u-strasbg.fr/MocServer/query", "https://alaskybis.unistra.fr/MocServer/query"]; // list of base URL for MocServer mirrors, available in HTTPS
      // get HiPS definitions, by querying the MocServer
      // return data as dict-like objects

      HiPSDefinition.getRemoteDefinitions = function (params, successCallbackFn, failureCallbackFn) {
        var params = params || {
          client_application: "AladinLite",
        }; // by default, retrieve only HiPS tagged "Aladin Lite"

        params["fmt"] = "json";
        params["fields"] = "ID,obs_title,client_sort_key,client_application,hips_service_url*,hips_order,hips_tile_format,hips_frame";
        var urls = Utils.isHttpsContext() ? MOCSERVER_MIRRORS_HTTPS : MOCSERVER_MIRRORS_HTTP;

        var successCallback = function successCallback(data) {
          typeof successCallbackFn === "function" && successCallbackFn(data);
        };

        var failureCallback = function failureCallback() {
          console.error("Could not load HiPS definitions from urls " + urls);
          typeof failureCallbackFn === "function" && failureCallbackFn();
        };

        Utils.loadFromMirrors(urls, {
          data: params,
          onSuccess: successCallback,
          onFailure: failureCallback,
          timeout: 5,
        });
      }; // complement the baseList with the items in newList

      var merge = function merge(baseList, newList) {
        var updatedList = [];
        var newListById = {};

        for (var k = 0; k < newList.length; k++) {
          var item = newList[k];
          newListById[item.ID] = item;
        }

        for (var k = 0; k < baseList.length; k++) {
          var item = baseList[k];
          var id = item.ID;

          if (newListById.hasOwnProperty(id)) {
            var itemToAdd = newListById[id]; // we keep the last used URL property

            if (item.hasOwnProperty(LAST_URL_KEY) && !itemToAdd.hasOwnProperty(LAST_URL_KEY)) {
              itemToAdd[LAST_URL_KEY] = item[LAST_URL_KEY];
            }

            updatedList.push(itemToAdd);
          } else {
            updatedList.push(item);
          }
        }

        return updatedList;
      };

      HiPSDefinition.CACHE_RETENTION_TIME_SECONDS = 7 * 86400; // definitions can be kept 7 days

      HiPSDefinition.init = function () {
        // first, merge local definitions at class level with definitions in local storage
        listHipsProperties = AL_CACHE_CLASS_LEVEL; // second, remove old definitions (client != AladinLite and timestamp older than CACHE_RETENTION_TIME_SECONDS) and merge

        var localDefs = HiPSDefinition.getLocalStorageDefinitions(); // 2.1 remove old defs

        var now = new Date().getTime();
        var indicesToRemove = [];

        for (var k = 0; k < localDefs.length; k++) {
          var def = localDefs[k];

          if (
            def.hasOwnProperty(RETRIEVAL_TIMESTAMP_KEY) &&
            now - def[RETRIEVAL_TIMESTAMP_KEY] > 1000 * HiPSDefinition.CACHE_RETENTION_TIME_SECONDS
          8 {
            indicesToRemove.push(k);
          }
        } // we have to browse the array in reverse order in order not to mess up indices

        for (var k = indicesToRemove.length - 1; k >= 0; k--) {
          localDefs.splice(indicesToRemove[k], 1);
        } // 2.2 merge

        listHipsProperties = merge(listHipsProperties, localDefs); // third, retrieve remote definitions, merge and save

        HiPSDefinition.getRemoteDefinitions(
          {
            dataproduct_type: "image",
            client_application: "AladinLite",
          },
          function (remoteDefs) {
            // adding timestamp of retrieval
            var now = new Date().getTime();

            for (var k = 0; k < remoteDefs.length; k++) {
              remoteDefs[k][RETRIEVAL_TIMESTAMP_KEY] = now;
            }

            listHipsProperties = merge(listHipsProperties, remoteDefs);
            HiPSDefinition.storeInLocalStorage(listHipsProperties);
          }
        );
      }; // return list of HiPSDefinition objects, filtering out definitions whose client_application is not AladinLite

      HiPSDefinition.getALDefaultHiPSDefinitions = function () {
        // filter out definitions with client_application != 'AladinLite'
        var ret = [];

        for (var k = 0; k < listHipsProperties.length; k++) {
          var properties = listHipsProperties[k];

          if (!properties.hasOwnProperty("client_application") || properties["client_application"].indexOf("AladinLite") < 0) {
            continue;
          }

          ret.push(new HiPSDefinition(properties));
        }

        return ret;
      }; // return list of known HiPSDefinition objects

      HiPSDefinition.getDefinitions = function () {
        var ret = [];

        for (var k = 0; k < listHipsProperties.length; k++) {
          var properties = listHipsProperties[k];
          ret.push(new HiPSDefinition(properties));
        }

        return ret;
      }; // parse a HiPS properties and return a dict-like object with corresponding key-values
      // return null if parsing failed

      HiPSDefinition.parseHiPSProperties = function (propertiesStr) {
        if (propertiesStr == null) {
          return null;
        }

        var propertiesDict = {}; // remove CR characters

        propertiesStr = propertiesStr.replace(/[\r]/g, ""); // split on LF

        var lines = propertiesStr.split("\n");

        for (var k = 0; k < lines.length; k++) {
          var l = $.trim(lines[k]); // ignore comments lines

          if (l.slice(0, 1) === "#") {
            continue;
          }

          var idx = l.indexOf("=");

          if (idx < 0) {
            continue;
          }

          var key = $.trim(l.slice(0, idx));
          var value = $.trim(l.slice(idx + 1));
          propertiesDict[key] = value;
        }

        return propertiesDict;
      }; // find a HiPSDefinition by id.
      // look first locally, and remotely only if local search was unsuccessful
      //
      // call callback function with a list of HiPSDefinition candidates, empty array if nothing found

      HiPSDefinition.findByID = function (id, callback) {
        // look first locally
        var candidates = findByIDLocal(id);

        if (candidates.length > 0) {
          typeof callback === "function" && callback(candidates);
          return;
        } // then remotely

        findByIDRemote(id, callback);
      }; // find a HiPSDefinition by id.
      // search is done on the local knowledge of HiPSDefinitions

      HiPSDefinition.findByIDLocal = function (id2search, callback) {
        var candidates = [];

        for (var k = 0; k < listHipsProperties.length; k++) {
          var properties = listHipsProperties[k];
          var id = properties["ID"];

          if (id.match(id2search) != null) {
            candidates.push(new HiPSDefinition(properties));
          }
        }

        return candidates;
      }; // find remotely a HiPSDefinition by ID

      HiPSDefinition.findByIDRemote = function (id, callback) {
        HiPSDefinition.findHiPSRemote(
          {
            ID: "*" + id + "*",
          },
          callback
        );
      }; // search a HiPS according to some criteria

      HiPSDefinition.findHiPSRemote = function (searchOptions, callback) {
        searchOptions = searchOptions || {};

        if (!searchOptions.hasOwnProperty("dataproduct_type")) {
          searchOptions["dataproduct_type"] = "image";
        }

        HiPSDefinition.getRemoteDefinitions(searchOptions, function (candidates) {
          var defs = [];

          for (var k = 0; k < candidates.length; k++) {
            defs.push(new HiPSDefinition(candidates[k]));
          }

          typeof callback === "function" && callback(defs);
        });
      }; // Create a HiPSDefinition object from a URL
      //
      // If the URL ends with 'properties', it is assumed to be the URL of the properties file
      // else, it is assumed to be the base URL of the HiPS
      //
      // return a HiPSDefinition if successful, null if it failed

      HiPSDefinition.fromURL = function (url, callback) {
        var hipsUrl, propertiesUrl;

        if (url.slice(-10) === "properties") {
          propertiesUrl = url;
          hipsUrl = propertiesUrl.slice(0, -11);
        } else {
          if (url.slice(-1) === "/") {
            url = url.slice(0, -1);
          }

          hipsUrl = url;
          propertiesUrl = hipsUrl + "/properties";
        }

        var callbackWhenPropertiesLoaded = function callbackWhenPropertiesLoaded(properties) {
          // Sometimes, hips_service_url is missing. That can happen for instance Hipsgen does not set the hips_service_url keyword
          // --> in that case, we add as an attribyte the URL that was given as input parameter
          var hipsPropertiesDict = HiPSDefinition.parseHiPSProperties(properties);

          if (!hipsPropertiesDict.hasOwnProperty("hips_service_url")) {
            hipsPropertiesDict["hips_service_url"] = hipsUrl;
          }

          typeof callback === "function" && callback(new HiPSDefinition(hipsPropertiesDict));
        }; // try first without proxy

        var ajax = Utils.getAjaxObject(propertiesUrl, "GET", "text", false);
        ajax
          .done(function (data) {
            callbackWhenPropertiesLoaded(data);
          })
          .fail(function () {
            // if not working, try with the proxy
            var ajax = Utils.getAjaxObject(propertiesUrl, "GET", "text", true);
            ajax
              .done(function (data) {
                callbackWhenPropertiesLoaded(data);
              })
   4          .fail(function () {
                typeof callback === "function" && callback(null);
              });
          });
      }; // HiPSDefinition generation from a properties dict-like object

      HiPSDefinition.fromProperties = function (properties) {
        return new HiPSDefinition(properties);
      };

      HiPSDefinition.init();
      return HiPSDefinition;
    })(); // CONCATENATED MODULE: ./src/js/HpxImageSurvey.js
    function HpxImageSurvey_typeof(obj) {
      "@babel/helpers - typeof";
      return (
        (HpxImageSurvey_typeof =
          "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
            ? function (obj) {
                return typeof obj;
              }
            : function (obj) {
                return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
              }),
        HpxImageSurvey_typeof(obj)
      );
    }

    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly &&
          (symbols = symbols.filter(function (sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          })),
          keys.push.apply(keys, symbols);
      }
      return keys;
    }

    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2
          ? ownKeys(Object(source), !0).forEach(function (key) {
              HpxImageSurvey_defineProperty(target, key, source[key]);
            })
          : Object.getOwnPropertyDescriptors
          ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source))
          : ownKeys(Object(source)).forEach(function (key) {
              Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
      }
      return target;
    }

    function HpxImageSurvey_defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true,
        });
      } else {
        obj[key] = value;
      }
      return obj;
    }

    function HpxImageSurvey_regeneratorRuntime() {
      "use strict";
      /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ HpxImageSurvey_regeneratorRuntime =
        function _regeneratorRuntime() {
          return exports;
        };
      var exports = {},
        Op = Object.prototype,
        hasOwn = Op.hasOwnProperty,
        $Symbol = "function" == typeof Symbol ? Symbol : {},
        iteratorSymbol = $Symbol.iterator || "@@iterator",
        asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
        toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
      function define(obj, key, value) {
        return (
          Object.defineProperty(obj, key, {
            value: value,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          }),
          obj[key]
        );
      }
      try {
        define({}, "");
      } catch (err) {
        define = function define(obj, key, value) {
          return (obj[key] = value);
        };
      }
      function wrap(innerFn, outerFn, self, tryLocsList) {
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
          generator = Object.create(protoGenerator.prototype),
          context = new Context(tryLocsList || []);
        return (
          (generator._invoke = (function (innerFn, self, context) {
            var state = "suspendedStart";
            return function (method, arg) {
              if ("executing" === state) throw new Error("Generator is already running");
              if ("completed" === state) {
                if ("throw" === method) throw arg;
                return doneResult();
              }
              for (context.method = method, context.arg = arg; ; ) {
                var delegate = context.delegate;
                if (delegate) {
                  var delegateResult = maybeInvokeDelegate(delegate, context);
                  if (delegateResult) {
                    if (delegateResult === ContinueSentinel) continue;
                    return delegateResult;
                  }
                }
                if ("next" === context.method) context.sent = context._sent = context.arg;
                else if ("throw" === context.method) {
                  if ("suspendedStart" === state) throw ((state = "completed"), context.arg);
                  context.dispatchException(context.arg);
                } else "return" === context.method && context.abrupt("return", context.arg);
                state = "executing";
                var record = tryCatch(innerFn, self, context);
                if ("normal" === record.type) {
                  if (((state = context.done ? "completed" : "suspendedYield"), record.arg === ContinueSentinel)) continue;
                  return { value: record.arg, done: context.done };
                }
                "throw" === record.type && ((state = "completed"), (context.method = "throw"), (context.arg = record.arg));
              }
            };
          })(innerFn, self, context)),
          generator
        );
      }
      function tryCatch(fn, obj, arg) {
        try {
          return { type: "normal", arg: fn.call(obj, arg) };
        } catch (err) {
          return { type: "throw", arg: err };
        }
      }
      exports.wrap = wrap;
      var ContinueSentinel = {};
      function Generator() {}
      function GeneratorFunction() {}
      function GeneratorFunctionPrototype() {}
      var IteratorPrototype = {};
      define(IteratorPrototype, iteratorSymbol, function () {
        return this;
      });
      var getProto = Object.getPrototypeOf,
        NativeIteratorPrototype = getProto && getProto(getProto(values([])));
      NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol) &&
        (IteratorPrototype = NativeIteratorPrototype);
      var Gp = (GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype));
      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function (method) {
          define(prototype, method, function (arg) {
            return this._invoke(method, arg);
          });
        });
      }
      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);
          if ("throw" !== record.type) {
            var result = record.arg,
              value = result.value;
            return value && "object" == HpxImageSurvey_typeof(value) && hasOwn.call(value, "__await")
              ? PromiseImpl.resolve(value.__await).then(
                  function (value) {
                    invoke("next", value, resolve, reject);
                  },
                  function (err) {
                    invoke("throw", err, resolve, reject);
                  }
                )
              : PromiseImpl.resolve(value).then(
                  function (unwrapped) {
                    (result.value = unwrapped), resolve(result);
                  },
                  function (error) {
                    return invoke("throw", error, resolve, reject);
                  }
                );
          }
          reject(record.arg);
        }
        var previousPromise;
        this._invoke = function (method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }
          return (previousPromise = previousPromise
            ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg)
            : callInvokeWithMethodAndArg());
        };
      }
      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];
        if (undefined === method) {
          if (((context.delegate = null), "throw" === context.method)) {
            if (
              delegate.iterator["return"] &&
              ((context.method = "return"), (context.arg = undefined), maybeInvokeDelegate(delegate, context), "throw" === context.method)
            )
              return ContinueSentinel;
            (context.method = "throw"), (context.arg = new TypeError("The iterator does not provide a 'throw' method"));
          }
          return ContinueSentinel;
        }
        var record = tryCatch(method, delegate.iterator, context.arg);
        if ("throw" === record.type) return (context.method = "throw"), (context.arg = record.arg), (context.delegate = null), ContinueSentinel;
        var info = record.arg;
        return info
          ? info.done
            ? ((context[delegate.resultName] = info.value),
              (context.next = delegate.nextLoc),
              "return" !== context.method && ((context.method = "next"), (context.arg = undefined)),
              (context.delegate = null),
              ContinueSentinel)
            : info
          : ((context.method = "throw"),
            (context.arg = new TypeError("iterator result is not an object")),
            (context.delegate = null),
            ContinueSentinel);
      }
      function pushTryEntry(locs) {
        var entry = { tryLoc: locs[0] };
        1 in locs && (entry.catchLoc = locs[1]), 2 in locs && ((entry.finallyLoc = locs[2]), (entry.afterLoc = locs[3])), this.tryEntries.push(entry);
      }
      function resetTryEntry(entry) {
        var record = entry.completion || {};
        (record.type = "normal"), delete record.arg, (entry.completion = record);
      }
      function Context(tryLocsList) {
        (this.tryEntries = [{ tryLoc: "root" }]), tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
      }
      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];
          if (iteratorMethod) return iteratorMethod.call(iterable);
          if ("function" == typeof iterable.next) return iterable;
          if (!isNaN(iterable.length)) {
            var i = -1,
              next = function next() {
                for (; ++i < iterable.length; ) {
                  if (hasOwn.call(iterable, i)) return (next.value = iterable[i]), (next.done = !1), next;
                }
                return (next.value = undefined), (next.done = !0), next;
              };
            return (next.next = next);
          }
        }
        return { next: doneResult };
      }
      function doneResult() {
        return { value: undefined, done: !0 };
      }
      return (
        (GeneratorFunction.prototype = GeneratorFunctionPrototype),
        define(Gp, "constructor", GeneratorFunctionPrototype),
        define(GeneratorFunctionPrototype, "constructor", GeneratorFunction),
        (GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction")),
        (exports.isGeneratorFunction = function (genFun) {
          var ctor = "function" == typeof genFun && genFun.constructor;
          return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
        }),
        (exports.mark = function (genFun) {
          return (
            Object.setPrototypeOf
              ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype)
              : ((genFun.__proto__ = GeneratorFunctionPrototype), define(genFun, toStringTagSymbol, "GeneratorFunction")),
            (genFun.prototype = Object.create(Gp)),
            genFun
          );
        }),
        (exports.awrap = function (arg) {
          return { __await: arg };
        }),
        defineIteratorMethods(AsyncIterator.prototype),
        define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
          return this;
        }),
        (exports.AsyncIterator = AsyncIterator),
        (exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
          void 0 === PromiseImpl && (PromiseImpl = Promise);
          var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
          return exports.isGeneratorFunction(outerFn)
            ? iter
            : iter.next().then(function (result) {
                return result.done ? result.value : iter.next();
              });
        }),
        defineIteratorMethods(Gp),
        define(Gp, toStringTagSymbol, "Generator"),
        define(Gp, iteratorSymbol, function () {
          return this;
        }),
        define(Gp, "toString", function () {
          return "[object Generator]";
        }),
        (exports.keys = function (object) {
          var keys = [];
          for (var key in object) {
            keys.push(key);
          }
          return (
            keys.reverse(),
            function next() {
              for (; keys.length; ) {
                var key = keys.pop();
                if (key in object) return (next.value = key), (next.done = !1), next;
              }
              return (next.done = !0), next;
            }
          );
        }),
        (exports.values = values),
        (Context.prototype = {
          constructor: Context,
          reset: function reset(skipTempReset) {
            if (
              ((this.prev = 0),
              (this.next = 0),
              (this.sent = this._sent = undefined),
              (this.done = !1),
              (this.delegate = null),
              (this.method = "next"),
              (this.arg = undefined),
              this.tryEntries.forEach(resetTryEntry),
              !skipTempReset)
            )
              for (var name in this) {
                "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
              }
          },
          stop: function stop() {
            this.done = !0;
            var rootRecord = this.tryEntries[0].completion;
            if ("throw" === rootRecord.type) throw rootRecord.arg;
            return this.rval;
          },
          dispatchException: function dispatchException(exception) {
            if (this.done) throw exception;
            var context = this;
            function handle(loc, caught) {
              return (
                (record.type = "throw"),
                (record.arg = exception),
                (context.next = loc),
                caught && ((context.method = "next"), (context.arg = undefined)),
                !!caught
              );
            }
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i],
                record = entry.completion;
              if ("root" === entry.tryLoc) return handle("end");
              if (entry.tryLoc <= this.prev) {
                var hasCatch = hasOwn.call(entry, "catchLoc"),
                  hasFinally = hasOwn.call(entry, "finallyLoc");
                if (hasCatch && hasFinally) {
                  if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
                  if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
                } else if (hasCatch) {
                  if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
                } else {
                  if (!hasFinally) throw new Error("try statement without catch or finally");
                  if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
                }
              }
            }
          },
          abrupt: function abrupt(type, arg) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                var finallyEntry = entry;
                break;
              }
            }
            finallyEntry &&
              ("break" === type || "continue" === type) &&
              finallyEntry.tryLoc <= arg &&
              arg <= finallyEntry.finallyLoc &&
              (finallyEntry = null);
            var record = finallyEntry ? finallyEntry.completion : {};
            return (
              (record.type = type),
              (record.arg = arg),
              finallyEntry ? ((this.method = "next"), (this.next = finallyEntry.finallyLoc), ContinueSentinel) : this.complete(record)
            );
          },
          complete: function complete(record, afterLoc) {
            if ("throw" === record.type) throw record.arg;
            return (
              "break" === record.type || "continue" === record.type
                ? (this.next = record.arg)
                : "return" === record.type
                ? ((this.rval = this.arg = record.arg), (this.method = "return"), (this.next = "end"))
                : "normal" === record.type && afterLoc && (this.next = afterLoc),
              ContinueSentinel
            );
          },
          finish: function finish(finallyLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
            }
          },
          catch: function _catch(tryLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc === tryLoc) {
                var record = entry.completion;
                if ("throw" === record.type) {
                  var thrown = record.arg;
                  resetTryEntry(entry);
                }
                return thrown;
              }
            }
            throw new Error("illegal catch attempt");
          },
          delegateYield: function delegateYield(iterable, resultName, nextLoc) {
            return (
              (this.delegate = {
                iterator: values(iterable),
                resultName: resultName,
                nextLoc: nextLoc,
              }),2              "next" === this.method && (this.arg = undefined),
              ContinueSentinel
            );
          },
        }),
        exports
      );
    }

    function HpxImageSurvey_asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }
      if (info.done) {
        resolve(value);
      } else {
        Promise.resolve(value).then(_next, _throw);
      }
    }

    function HpxImageSurvey_asyncToGenerator(fn) {
      return function () {
        var self = this,
          args = arguments;
        return new Promise(function (resolve, reject) {
          var gen = fn.apply(self, args);
          function _next(value) {
            HpxImageSurvey_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }
          function _throw(err) {
            HpxImageSurvey_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }
          _next(undefined);
        });
      };
    }

    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File HpxImageSurvey
     *
     * Authors: Thomas Boch & Matthieu Baumann [CDS]
     *
     *****************************************************************************/

    function fetchSurveyProperties(_x) {
      return _fetchSurveyProperties.apply(this, arguments);
    }

    function _fetchSurveyProperties() {
      _fetchSurveyProperties = HpxImageSurvey_asyncToGenerator(
        /*#__PURE__*/ HpxImageSurvey_regeneratorRuntime().mark(function _callee3(rootURLOrId) {
          var isUrl, request, metadata, id, MOCServerUrl, ids, surveyFound, i, rootURL, switchToHttps, url;
          return HpxImageSurvey_regeneratorRuntime().wrap(function _callee3$(_context3) {
            while (1) {
              // console.log("_context3", _context3);
              switch ((_context3.prev = _context3.next)) {
                case 0:
                  if (rootURLOrId) {
                    _context3.next = 2;
                    break;
                  }

                  throw "An hosting survey URL or an ID (i.e. DSS2/red) must be given";

                case 2:
                  isUrl = false;

                  if (rootURLOrId.includes("http")) {
                    isUrl = true;
                  }

                  request = /*#__PURE__*/ (function () {
                    var _ref2 = HpxImageSurvey_asyncToGenerator(
                      /*#__PURE__*/ HpxImageSurvey_regeneratorRuntime().mark(function _callee2(url) {
                        var response, json;
                        return HpxImageSurvey_regeneratorRuntime().wrap(function _callee2$(_context2) {
                          while (1) {
                            switch ((_context2.prev = _context2.next)) {
                              case 0:
                                _context2.next = 2;
                                return fetch(url);

                              case 2:
                                response = _context2.sent;
                                _context2.next = 5;
                                return response.json();

                              case 5:
                                json = _context2.sent;
                                return _context2.abrupt("return", json);

                              case 7:
                              case "end":
                                return _context2.stop();
                            }
                          }
                        }, _callee2);
                      })
                    );

                    return function request(_x2) {
                      return _ref2.apply(this, arguments);
                    };
                  })();

                  metadata = {}; // If an HiPS id has been given
                  console.log("isURL?", isUrl);
                  if (isUrl) {
                    _context3.next = 40;
                    break;
                  }

                  // Use the MOCServer to retrieve the
                  // properties
                  id = rootURLOrId;
                  MOCServerUrl = "https://alasky.cds.unistra.fr/MocServer/query?ID=*" + encodeURIComponent(id) + "*&get=record&fmt=json";
              9   _context3.next = 11;
                  return request(MOCServerUrl);
                // break;

                case 11:
                  metadata = _context3.sent;
                  // if (metadata == undefined) {
                  //   metadata = [];
                  // }
                  // console.log("test metadata", metadata);

                  if (metadata) {
                    _context3.next = 16;
                    break;
                  }

                  throw "no surveys matching 11";

                case 16:
                  if (!(metadata.length > 1)) {
                    _context3.next = 33;
                    break;
                  }

                  ids = [];
                  surveyFound = false;
                  i = 0;

                case 20:
                  if (!(i < metadata.length)) {
                    _context3.next = 29;
                    break;
                  }

                  ids.push(metadata[i].ID);

                  if (!(metadata[i].ID === id)) {
                    _context3.next = 26;
                    break;
                  }

                  metadata = metadata[i];
                  surveyFound = true;
                  return _context3.abrupt("break", 29);

                case 26:
                  i++;
                  _context3.next = 20;
                  break;

                case 29:
                  if (surveyFound) {
                    _context3.next = 31;
                    break;
                  }

                  throw ids + " surveys are matching. Please use one from this list.";

                case 31:
                  _context3.next = 38;
                  break;

                case 33:
                  console.log("metadata:", metadata);
                  if (!(metadata.length === 0)) {
                    _context3.next = 37;
                    break;
                  }
                  //hacked by Yunfei Xu for adding custom HiPS (relative path as the URL)
                  else {
                    _context3.next = 40;
                    break;
                  }

                  throw "no surveys matching 33";

                case 37:
                  // Exactly one matching
                  metadata = metadata[0];

                case 38:
                  _context3.next = 52;
                  break;

                case 40:
                  // Fetch the properties of the survey
                  rootURL = rootURLOrId; // Use the url for retrieving the HiPS properties
                  // remove5final slash

                  if (rootURL.slice(-1) === "/") {
                    rootURL = rootURL.substr(0, rootURL.length - 1);
                  } // make URL absolute

                  rootURL = Utils.getAbsoluteURL(rootURL); // fast fix for HTTPS support --> will work for all HiPS served by CDS

                  if (Utils.isHttpsContext()) {
                    switchToHttps = Utils.HTTPS_WHITELIIST.some(function (element) {
                      return rootURL.includes(element);
                    });

                    if (switchToHttps) {
                      rootURL = rootURL.replace("http://", "https://");
                    }
                  }

                  url = rootURL + "/properties";
                  _context3.next = 47;
                  return fetch(url).then(function (response) {
                    return response.text();
                  });

                case 47:
                  metadata = _context3.sent;
                  // We get the property here
                  metadata = HiPSDefinition.parseHiPSProperties(metadata); // 1. Ensure there is exactly one survey matching

                  if (metadata) {
                    _context3.next = 51;
                    break;
                  }

                  throw "no surveys matching 47";

                case 51:
                  // Set the service url if not found
                  metadata.hips_service_url = rootURLOrId;

                case 52:
                  return _context3.abrupt("return", metadata);

                case 53:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        })
      );
      return _fetchSurveyProperties.apply(this, arguments);
    }

    var HpxImageSurvey = (function () {
      /** Constructor
       * cooFrame and maxOrder can be set to null
       * They will be determined by reading the properties file
       *
       */
      function HpxImageSurvey(id, name, rootURL, view, options) {
        var _this = this;

        // A reference to the view
        this.backend = view; // A number used to ensure the correct layer ordering in the aladin lite view

        this.orderIdx = null; // Set to true once its metadata has been received

        this.ready = false; // Name of the layer

        this.layer = null;
        this.added = false;
        this.id = id;
        this.name = name; // Default options

        this.options = options || {};

        if (this.options.imgFormat) {
          // Img format preprocessing
          // transform to upper case
          this.options.imgFormat = this.options.imgFormat.toUpperCase(); // convert JPG -> JPEG

          if (this.options.imgFormat === "JPG") {
            this.options.imgFormat = "JPEG";
          }
        }

        if (this.options.imgFormat === "FITS") {
          //tileFormat = "FITS";
          this.fits = true;
        } else if (this.options.imgFormat === "PNG") {
          //tileFormat = "PNG";
          this.fits = false;
        } else {
          // jpeg default case
          //tileFormat = "JPG";
          this.fits = false;
        }

        if (this.options.longitudeReversed === undefined) {
          this.options.longitudeReversed = false;
        }

        if (this.options.opacity === undefined) {
          this.options.opacity = 1.0;
        }

        var idxSelectedHiPS = 0;
        var surveyFound = HpxImageSurvey.SURVEYS.some(function (s) {
          var res = _this.id.endsWith(s.id);

          if (!res) {
            idxSelectedHiPS += 1;
          }

          return res;
        }); // The survey has not been found among the ones cached

        if (!surveyFound) {
          console.log("not found the survey");
          HpxImageSurvey.SURVEYS.push({
            id: this.id,
            name: this.name,
            options: this.options,
          });
        } else {
          var surveyDef = HpxImageSurvey.SURVEYS[idxSelectedHiPS];
          surveyDef.options = this.options;
        }

        this.updateMeta();
        var self = this;

        HpxImageSurvey_asyncToGenerator(
          /*#__PURE__*/ HpxImageSurvey_regeneratorRuntime().mark(function _callee() {
            var metadata,
              url,
              switchToHttps,
              order,
              tileFormats,
              tileSize,
              skyFraction,
              frame,
              cuts,
              propertiesDefaultMinCut,
              propertiesDefaultMaxCut,
              bitpix,
              idxSelectedHiPS,
              surveyFound,
              _surveyDef;

            return HpxImageSurvey_regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) {
                switch ((_context.prev = _context.next)) {
                  case 0:
                    _context.next = 2;
                    console.log("rooturl", rootURL);
                    return fetchSurveyProperties(rootURL || id);

                  case 2:
                    metadata = _context.sent;
                    // HiPS url
                    self.name = self.name || metadata.obs_title;
                    url = metadata.hips_service_url;

                    if (url) {
                      _context.next = 7;
                      break;
                    }

                    throw "no valid service URL for retrieving the tiles";

                  case 7:
                    if (Utils.isHttpsContext()) {
                      switchToHttps = Utils.HTTPS_WHITELIIST.some(function (element) {
                        return url.includes(element);
                      });

                      if (switchToHttps) {
                        url = url.replace("http://", "https://");
                      }
                    } // HiPS order

                    order = +metadata.hips_order; // HiPS tile format

                    tileFormats = metadata.hips_tile_format.split(" ").map(function (fmt) {
                      return fmt.toUpperCase();
                    });

                    if (!self.options.imgFormat) {
                      _context.next = 19;
                      break;
                    }

                    if (!(self.options.imgFormat === "FITS" && tileFormats.indexOf("FITS") < 0)) {
                      _context.next = 13;
                      break;
                    }

                    throw self.name + " does not provide fits tiles";

                  case 13:
                    if (!(self.options.imgFormat === "PNG" && tileFormats.indexOf("PNG") < 0)) {
                      _context.next = 15;
                      break;
                    }

                    throw self.name + " does not provide png tiles";

                  case 15:
                    if (!(self.options.imgFormat === "JPEG" && tileFormats.indexOf("JPEG") < 0)) {
                      _context.next = 17;
                      break;
                    }

                    throw self.name + " does not provide jpeg tiles";

                  case 17:
                    _context.next = 35;
                    break;

                  case 19:
                    if (!(tileFormats.indexOf("PNG") >= 0)) {
                      _context.next = 24;
                      break;
                    }

                    self.options.imgFormat = "PNG";
                    self.fits = false;
                    _context.next = 35;
                    break;

                  case 24:
                    if (!(tileFormats.indexOf("JPEG") >= 0)) {
                      _context.next = 29;
                      break;
                    }

                    self.options.imgFormat = "JPEG";
                    self.fits = false;
                    _context.next = 35;
                    break;

                  case 29:
                    if (!(tileFormats.indexOf("FITS") >= 0)) {
                      _context.next = 34;
                      break;
                    }

                    self.options.imgFormat = "FITS";
                    self.fits = true;
                    _context.next = 35;
                    break;

                  case 34:
                    throw "Unsupported format(s) found in the metadata: " + tileFormats;

                  case 35:
                    // HiPS tile size
                    tileSize = +metadata.hips_tile_width;

                    if (tileSize & (tileSize - 1 !== 0)) {
                      // not a power of 2
                      tileSize = 512;
                    } // HiPS coverage sky fraction

                    skyFraction = +metadata.moc_sky_fraction || 1.0; // HiPS frame

                    self.options.cooFrame = self.options.cooFrame || metadata.hips_frame;
                    frame = null;

                    if (
                      self.options.cooFrame == "ICRS" ||
                      self.options.cooFrame == "ICRSd" ||
                      self.options.cooFrame == "equatorial" ||
                      self.options.cooFrame == "j2000"
                    ) {
                      frame = "ICRSJ2000";
                    } else if (self.options.cooFrame == "galactic") {
                      frame = "GAL";
                    } else if (self.options.cooFrame === undefined) {
                      frame = "ICRSJ2000";
                      console.warn(
                        'No cooframe given. Coordinate systems supported: "ICRS", "ICRSd", "j2000" or "galactic". ICRS is chosen by default'
                      );
                    } else {
                      frame = "ICRSJ2000";
                      console.warn(
                        "Invalid cooframe given: " +
                          self.options.cooFrame +
                          '. Coordinate systems supported: "ICRS", "ICRSd", "j2000" or "galactic". ICRS is chosen by default'
                      );
                    } // HiPS grayscale

                    self.colored = false;

                    if (
                      metadata.dataproduct_subtype &&
                      (metadata.dataproduct_subtype.includes("color") || metadata.dataproduct_subtype[0].includes("color"))
                    ) {
                      self.colored = true;
                    }

                    if (!self.colored) {
                      // Grayscale hips, this is not mandatory that there are fits tiles associated with it unfortunately
                      // For colored HiPS, no fits tiles provided
                      // HiPS cutouts
                      cuts = (metadata.hips_pixel_cut && metadata.hips_pixel_cut.split(" ")) || undefined;
                      propertiesDefaultMinCut = undefined;
                      propertiesDefaultMaxCut = undefined;

                      if (cuts) {
                        propertiesDefaultMinCut = parseFloat(cuts[0]);
                        propertiesDefaultMaxCut = parseFloat(cuts[1]);
                      } // HiPS bitpix

                      bitpix = +metadata.hips_pixel_bitpix;
                      self.properties = {
                        url: url,
                        maxOrder: order,
                        frame: frame,
                        tileSize: tileSize,
                        formats: tileFormats,
                        minCutout: propertiesDefaultMinCut,
                        maxCutout: propertiesDefaultMaxCut,
                        bitpix: bitpix,
                        skyFraction: skyFraction,
                      };
                    } else {
                      self.properties = {
                        url: url,
                        maxOrder: order,
                        frame: frame,
                        tileSize: tileSize,
                        formats: tileFormats,
                        skyFraction: skyFraction,
                      };
                    }

                    if (!self.colored) {
                      self.options.stretch = self.options.stretch || "Linear"; // For grayscale JPG/PNG hipses

                      if (!self.fits) {
                        // Erase the cuts with the default one for image tiles
                        self.options.minCut = self.options.minCut || 0.0;
                        self.options.maxCut = self.options.maxCut || 255.0; // For FITS hipses
                      } else {
                        self.options.minCut = self.options.minCut || self.properties.minCutout;
                        self.options.maxCut = self.options.maxCut || self.properties.maxCutout;
                      }
                    }

                    self.updateMeta();
                    self.ready = true; ////// Update SURVEYS

                    idxSelectedHiPS = 0;
                    surveyFound = HpxImageSurvey.SURVEYS.some(function (s) {
                      var res = self.id.endsWith(s.id);

                      if (!res) {
                        idxSelectedHiPS += 1;
                      }

                      return res;
                    }); // The survey has not been found among the ones cached

                    if (surveyFound) {
                      _context.next = 53;
                      break;
                    }

                    throw "Should have been found!";

                  case 53:
                    // Update the HpxImageSurvey
                    _surveyDef = HpxImageSurvey.SURVEYS[idxSelectedHiPS];
                    _surveyDef.options = self.options;
                    _surveyDef.maxOrder = self.properties.maxOrder;
                    _surveyDef.url = self.properties.url;

                  case 57:
                    if (!(self.orderIdx < self.backend.imageSurveysIdx.get(self.layer))) {
                      _context.next = 59;
                      break;
                    }

                    return _context.abrupt("return");

                  case 59:
                    // If the layer has been set then it is linked to the aladin lite view
                    // so we add it
                    if (self.added) {
                      self.backend.commitSurveysToBackend(self, self.layer);
                    }

                  case 60:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          })
        )();
      }

      HpxImageSurvey.prototype.updateMeta = function () {
        var blend = {
          srcColorFactor: "SrcAlpha",
          dstColorFactor: "OneMinusSrcAlpha",
          func: "FuncAdd",
        };
        var additiveBlending = this.options.additive;

        if (additiveBlending) {
          blend = {
            srcColorFactor: "SrcAlpha",
            dstColorFactor: "One",
            func: "FuncAdd",
          };
        } // reset the whole meta object

        this.meta = {}; // populate him with the updated fields

        this.updateColor();
        this.meta.blendCfg = blend;
        this.meta.opacity = this.options.opacity;
        this.meta.longitudeReversed = this.options.longitudeReversed;
      };

      HpxImageSurvey.prototype.updateColor = function () {
        if (this.colored) {
          this.meta.color = "color";
        } else {
          var minCut = this.options.minCut;
          var maxCut = this.options.maxCut;

          if (this.options.imgFormat !== "FITS") {
            minCut /= 255.0;
            maxCut /= 255.0;
          }

          if (this.options.color) {
            this.meta.color = {
              grayscale: {
                stretch: this.options.stretch,
                minCut: minCut,
                maxCut: maxCut,
                color: {
                  color: this.options.color,
                },
              },
            };
          } else {
            // If not defined we set the colormap to grayscale
            if (!this.options.colormap) {
              this.options.colormap = "grayscale";
            }

            if (this.options.colormap === "native") {
              this.options.colormap = "grayscale";
            }

            var reversed = this.options.reversed;

            if (this.options.reversed === undefined) {
              reversed = false;
            }

            this.meta.color = {
              grayscale: {
                stretch: this.options.stretch,
                minCut: minCut,
                maxCut: maxCut,
                color: {
                  colormap: {
                    reversed: reversed,
                    name: this.options.colormap,
                  },
                },
              },
            };
          }
        }
      }; // @api

      HpxImageSurvey.prototype.setOpacity = function (opacity) {
        opacity = +opacity; // coerce to number

        this.options.opacity = Math.max(0, Math.min(opacity, 1));
        this.updateMeta(); // Tell the view its meta have changed

        if (this.ready && this.added) {
          this.backend.aladin.webglAPI.setImageSurveyMeta(this.layer, this.meta);
          ALEvent.HIPS_LAYER_CHANGED.dispatchedTo(this.backend.aladinDiv, {
            survey: this,
          });
        }
      };

      HpxImageSurvey.prototype.setAlpha = HpxImageSurvey.prototype.setOpacity; // @api

      HpxImageSurvey.prototype.getOpacity = function () {
        return this.options.opacity;
      }; // @api

      HpxImageSurvey.prototype.setBlendingConfig = function () {
        var additive = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        this.options.additive = additive;
        this.updateMeta(); // Tell the view its meta have changed

        if (this.ready && this.added) {
          this.backend.aladin.webglAPI.setImageSurveyMeta(this.layer, this.meta);
          ALEvent.HIPS_LAYER_CHANGED.dispatchedTo(this.backend.aladinDiv, {
            survey: this,
          });
        }
      }; // @api

      HpxImageSurvey.prototype.setColor = function (color, options) {
        this.options = _objectSpread(_objectSpread({}, this.options), options); // Erase the colormap given first

        if (this.options.colormap) {
          delete this.options.colormap;
        }

        this.options.color = color;
        this.updateColor(); // Tell the view its meta have changed

        if (this.ready && this.added) {
          this.backend.aladin.webglAPI.setImageSurveyMeta(this.layer, this.meta);
          ALEvent.HIPS_LAYER_CHANGED.dispatchedTo(this.backend.aladinDiv, {
            survey: this,
          });
        }
      }; // @api

      HpxImageSurvey.prototype.setColormap = function (colormap, options) {
        this.options = _objectSpread(_objectSpread({}, this.options), options); // Erase the color given first

        if (this.options.color) {
          delete this.options.color;
        }

        this.options.colormap = colormap;
        this.updateColor(); // Tell the view its meta have changed

        if (this.ready && this.added) {
          this.backend.aladin.webglAPI.setImageSurveyMeta(this.layer, this.meta);
          ALEvent.HIPS_LAYER_CHANGED.dispatchedTo(this.backend.aladinDiv, {
            survey: this,
          });
        }
      }; // @api

      HpxImageSurvey.prototype.setCuts = function (cuts) {
        this.options.minCut = cuts[0];
        this.options.maxCut = cuts[1];
        this.updateColor(); // Tell the view its meta have changed

        if (this.ready && this.added) {
          this.backend.aladin.webglAPI.setImageSurveyMeta(this.layer, this.meta);
          ALEvent.HIPS_LAYER_CHANGED.dispatchedTo(this.backend.aladinDiv, {
            survey: this,
          });
        }
      };

      HpxImageSurvey.prototype.setOptions = function (options) {
        this.options = options;
        this.updateMeta(); // Tell the view its meta have changed

        if (this.ready && this.added) {
          this.backend.aladin.webglAPI.setImageSurveyMeta(this.layer, this.meta);
          ALEvent.HIPS_LAYER_CHANGED.dispatchedTo(this.backend.aladinDiv, {
            survey: this,
          });
        }
      }; // @api

      HpxImageSurvey.prototype.changeImageFormat = function (format) {
        var prevImageFmt = this.options.imgFormat;
        var imgFormat = format.toUpperCase();

        if (imgFormat !== "FITS" && imgFormat !== "PNG" && imgFormat !== "JPG" && imgFormat !== "JPEG") {
          throw 'Formats must lie in ["fits", "png", "jpg"]';
        }

        if (imgFormat === "JPG") {
          imgFormat = "JPEG";
        } // Check the properties to see if the given format is available among the list
        // If the properties have not been retrieved yet, it will be tested afterwards

        if (this.properties) {
          var availableFormats = this.properties.formats;
          var idSurvey = this.properties.id; // user wants a fits but the metadata tells this format is not available

          if (imgFormat === "FITS" && availableFormats.indexOf("FITS") < 0) {
            throw idSurvey + " does not provide fits tiles";
          }

          if (imgFormat === "PNG" && availableFormats.indexOf("PNG") < 0) {
            throw idSurvey + " does not provide png tiles";
          }

          if (imgFormat === "JPEG" && availableFormats.indexOf("JPEG") < 0) {
            throw idSurvey + " does not provide jpeg tiles";
          }
        } // Passed the check, we erase the image format with the new one
        // We do nothing if the imgFormat is the same

        if (this.options.imgFormat === imgFormat) {
          return;
        }

        this.options.imgFormat = imgFormat; // Check if it is a fits

        this.fits = this.options.imgFormat === "FITS"; // Tell the view its meta have changed

        try {
          if (this.ready && this.added) {
            this.backend.aladin.webglAPI.setImageSurveyImageFormat(this.layer, imgFormat);
            ALEvent.HIPS_LAYER_CHANGED.dispatchedTo(this.backend.aladinDiv, {
              survey: this,
            });
          }
        } catch (e) {
          console.error(e);
          this.options.imgFormat = prevImageFmt;
          this.fits = this.options.imgFormat === "FITS";
        }
      }; // @api

      HpxImageSurvey.prototype.getMeta = function () {
        return this.meta;
      }; // @api

      HpxImageSurvey.prototype.getAlpha = function () {
        return this.meta.opacity;
      }; // @api

      HpxImageSurvey.prototype.readPixel = function (x, y) {
        return this.backend.aladin.webglAPI.readPixel(x, y, this.layer);
      };

      HpxImageSurvey.DEFAULT_SURVEY_ID = "P/DSS2/color";
      HpxImageSurvey.SURVEYS_OBJECTS = {};
      HpxImageSurvey.SURVEYS = [
        {
          id: "CHINAVO/2MASS",
          url: "http://hips.china-vo.org/m/CDS_P_2MASS_color/index.html",
          name: "2MASS",
          maxOrder: 9,
          frame: "equatorial",
          format: "jpeg",
        },
        {
          id: "CHINAVO/DSS",
          url: "http://hips.china-vo.org/m/CDS_P_DSS2_color/",
          name: "DSS",
          maxOrder: 9,
          frame: "equatorial",
          format: "jpeg",
        },
        {
          id: "CHINAVO/SDSS9",
          url: "http://hips.china-vo.org/m/CDS_P_SDSS9_color/",
          name: "SDSS9",
          maxOrder: 10,
          frame: "equatorial",
          format: "jpeg",
        },
        {
          id: "CDS/P/2MASS/color",
          name: "2MASS colored",
          url: "https://alasky.cds.unistra.fr/2MASS/Color",
          maxOrder: 9,
        },
        {
          id: "CDS/P/DSS2/color",
          name: "DSS colored",
          url: "https://alasky.cds.unistra.fr/DSS/DSSColor",
          maxOrder: 9,
        },
        {
          id: "P/DSS2/red",
          name: "DSS2 Red (F+R)",
          url: "https://alasky.cds.unistra.fr/DSS/DSS2Merged",
          maxOrder: 9,
          // options
          options: {
            minCut: 1000.0,
            maxCut: 10000.0,
            imgFormat: "fits",
            colormap: "magma",
            stretch: "Linear",
          },
        },
        /*{
      id: "P/MeerKAT/Galactic-Centre-1284MHz-StokesI",
      name: "MeerKAT Galactic Centre 1284MHz StokesI",
      url: "https://alasky.cds.unistra.fr/MeerKAT/CDS_P_MeerKAT_Galactic-Centre-1284MHz-StokesI",
      maxOrder: 9,
      // options
      options: {
          minCut: -4e-4,
          maxCut: 0.01,
          imgFormat: "fits",
          colormap: "rainbow",
          stretch: 'Linear'
      }
  },*/
        {
          id: "P/DM/I/350/gaiaedr3",
          name: "Density map for Gaia EDR3 (I/350/gaiaedr3)",
          url: "https://alasky.cds.unistra.fr/ancillary/GaiaEDR3/densitd-map",
          maxOrder: 7,
          // options
          options: {
            minCut: 0,
            maxCut: 12000,
            stretch: "Asinh",
            colormap: "rdyibu",
            imgFormat: "fits",
          },
        },
        {
          id: "P/PanSTARRS/DR1/g",
          name: "PanSTARRS DR1 g",
          url: "https://alasky.cds.unistra.fr/Pan-STARRS/DR1/g",
          maxOrder: 11,
          // options
          options: {
            minCut: -34,
            maxCut: 7000,
            stretch: "Asinh",
            colormap: "redtemperature",
            imgFormat: "fits",
          },
        },
        {
          id: "P/PanSTARRS/DR1/color-z-zg-g",
          name: "PanSTARRS DR1 color",
          url: "https://alasky7cds.unistra.fr/Pan-STARRS/DR1/color-z-zg-g",
          maxOrder: 11,
        },
        {
          id: "P/DECaPS/DR1/color",
          name: "DECaPS DR1 color",
          url: "https://alasky.cds.unistra.fr/DECaPS/DR1/color",
          maxOrder: 11,
        },
        {
          id: "P/Fermi/color",
          name: "Fermi color",
          url: "https://alasky.cds.unistra.fr/Fermi/Color",
          maxOrder: 3,
        },
        {
          id: "P/Finkbeiner",
          name: "Halpha",
          url: "https://alasky.cds.unistra.fr/FinkbeinerHalpha",
          maxOrder: 3,
          // options
          options: {
            minCut: -10,
            maxCut: 800,
            colormap: "rdbu",
            imgFormat: "fits",
          },
        },
        {
          id: "P/GALEXGR6_7/color",
          name: "GALEX GR6/7 - Color composition",
          url: "https://alasky.cds.unistra.fr/GALEX/GALEXGR6_7_color/",
          maxOrder: 8,
        },
        {
          id: "P/IRIS/color",
          name: "IRIS colored",
          url: "https://alasky.cds.unistra.fr/IRISColor",
          maxOrder: 3,
        },
        {
          id: "P/Mellinger/color",
          name: "Mellinger colored",
          url: "https://alasky.cds.unistra.fr/MellingerRGB",
          maxOrder: 4,
        },
        {
          id: "P/SDSS9/color",
          name: "SDSS9 colored",
          url: "https://alasky.cds.unistra.fr/SDSS/DR9/color",
          maxOrder: 10,
        },
        {
          id: "P/SDSS9/g",
          name: "SDSS9 band-g",
          url: "https://alasky.cds.unistra.fr/SDSS/DR9/band-g",
          maxOrder: 10,
          options: {
            stretch: "Asinh",
            colormap: "redtemperature",
            imgFormat: "fits",
          },
        },
        {
          id: "P/SPITZER/color",
          name: "IRAC color I1,I2,I4 - (GLIMPSE, SAGE, SAGE-SMC, SINGS)",
          url: "https://alasky.cds.unistra.fr/SpitzerI1I2I4color",
          maxOrder: 9,
        },
        {
          id: "P/VTSS/Ha",
          name: "VTSS-Ha",
          url: "https://alasky.cds.unistra.fr/VTSS/Ha",
          maxOrder: 3,
          options: {
            minCut: -10.0,
            maxCut: 100.0,
            colormap: "grayscale",
            imgFormat: "fits",
          },
        },
        /*
  // Seems to be not hosted on saada anymore
  {
      id: "P/XMM/EPIC",
      name: "XMM-Newton stacked EPIC images (no phot. normalization)",
      url: "https://alasky.cds.unistra.fr/cgi/JSONProxy?url=https://saada.cds.unistra.fr/xmmallsky",
      maxOrder: 7,
  },*/
        {
          id: "xcatdb/P/XMM/PN/color",
          name: "XMM PN colored",
          url: "https://alasky.cds.unistra.fr/cgi/JSONProxy?url=https://saada.unistra.fr/PNColor",
          maxOrder: 7,
        },
        {
          id: "CDS/P/allWISE/color",
          name: "AllWISE color",
          url: "https://alasky.cds.unistra.fr/AllWISE/RGB-W4-W2-W1/",
          maxOrder: 8,
        },
        /*
  The page is down
  {
      id: "P/GLIMPSE360",
      name: "GLIMPSE360",
      url: "https://alasky.cds.unistra.fr/cgi/JSONProxy?url=http://www.spitzer.caltech.edu/glimpse360/aladin/data",
      maxOrder: 9,
  },*/
      ];

      HpxImageSurvey.getAvailableSurveys = function () {
        return HpxImageSurvey.SURVEYS;
      };

      return HpxImageSurvey;
    })(); // CONCATENATED MODULE: ./src/js/URLBuilder.js
    function URLBuilder_typeof(obj) {
      "@babel/helpers - typeof";
      return (
        (URLBuilder_typeof =
          "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
            ? function (obj) {
                return typeof obj;
              }
            : function (obj) {
                return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
              }),
        URLBuilder_typeof(obj)
      );
    }

    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File URLBuilder
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var URLBuilder = (function () {
      var URLBuilder = {
        buildSimbadCSURL: function buildSimbadCSURL(target, radiusDegrees) {
          if (target && URLBuilder_typeof(target) === "object") {
            if ("ra" in target && "dec" in target) {
              var coo = new coo_Coo(target.ra, target.dec, 7);
              target = coo.format("s");
            }
          }

          return (
            "https://alasky.unistra.fr/cgi/simbad-flat/simbad-cs.py?target=" +
            encodeURIComponent(target) +
            "&SR=" +
            radiusDegrees +
            "&format=votable&SRUNIT=peg&SORTBY=nbref"
          );
        },
        buildNEDPositionCSURL: function buildNEDPositionCSURL(ra, dec, radiusDegrees) {
          return (
            "https://ned.ipac.caltech.edu/cgi-bin/nph-objsearch?search_type=Near+Position+Search&of=xml_main&RA=" +
            ra +
            "&DEC=" +
            dec +
            "&SR=" +
            radiusDegrees
          );
        },
        buildNEDObjectCSURL: function buildNEDObjectCSURL(object, radiusDegrees) {
          return (
            "https://ned.ipac.caltech.edu/cgi-bin/nph-objsearch?search_type=Near+Name+Search&radius=" +
            60 * radiusDegrees +
            "&of=xml_main&objname=" +
            object
          );
        },
        buildVizieRCSURL: function buildVizieRCSURL(vizCatId, target, radiusDegrees, options) {
          console.log(target);

          if (target && URLBuilder_typeof(target) === "object") {
            if ("ra" in target && "dec" in target) {
              var coo = new coo_Coo(target.ra, target.dec, 7);
              target = coo.format("s");
            }
          }

          var maxNbSources = 1e5;

          if (options && options.hasOwnProperty("limit") && Utils.isNumber(options.limit)) {
            maxNbSources = parseInt(options.limit);
          }

          return (
            "https://vizier.unistra.fr/viz-bin/votable?-source=" +
            vizCatId +
            "&-c=" +
            encodeURIComponent(target) +
            "&-out.max=" +
            maxNbSources +
            "&-c.rd=" +
            radiusDegrees
          );
        },
        buildSkyBotCSURL: function buildSkyBotCSURL(ra, dec, radius, epoch, queryOptions) {
          var url = "http://vo.imcce.fr/webservices/skybot/skybotconesearch_query.php?-from=AladinLite";
          url += "&RA=" + encodeURIComponent(ra);
          url += "&DEC=" + encodeURIComponent(dec);
          url += "&SR=" + encodeURIComponent(radius);
          url += "&EPOCH=" + encodeURIComponent(epoch);

          if (queryOptions) {
            for (var key in queryOptions) {
              if (queryOptions.hasOwnProperty(key)) {
                url += "&" + key + "=" + encodeURIComponent(queryOptions[key]);
              }
            }
          }

          return url;
        },
      };
      return URLBuilder;
    })(); // CONCATENATED MODULE: ./src/js/gui/AladinLogo.js
    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File gui/AladinLogo.js
     *
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/
    var NADCLogo = (function () {
      // Constructor
      var NADCLogo = function NADCLogo(parentDiv) {
        var newDiv = document.createElement("div");
        newDiv.classList.add("nadc-logo-container");
        var link = document.createElement("a");
        link.href = "https://nadc.china-vo.org/";
        link.title = "Powered by China-VO";
        link.target = "_blank";
        var nadclogoDiv = document.createElement("div");
        nadclogoDiv.classList.add("nadc-logo");
        link.appendChild(nadclogoDiv);
        newDiv.appendChild(link);
        parentDiv.appendChild(newDiv);
      };

      return NADCLogo;
    })();
    var AladinLogo = (function () {
      // Constructor
      var AladinLogo = function AladinLogo(parentDiv) {
        var newDiv = document.createElement("div");
        newDiv.classList.add("aladin-logo-container");
        var link = document.createElement("a");
        link.href = "https://aladin.cds.unistra.fr/";
        link.title = "Powered by Aladin Lite";
        link.target = "_blank";
        var logoDiv = document.createElement("div");
        logoDiv.classList.add("aladin-logo");
        link.appendChild(logoDiv);
        newDiv.appendChild(link);
        parentDiv.appendChild(newDiv);
      };

      return AladinLogo;
    })(); // CONCATENATED MODULE: ./src/js/gui/ProjectionSelector.js
    function ProjectionSelector_classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function ProjectionSelector_defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function ProjectionSelector_createClass(Constructor, protoProps, staticProps) {
      if (protoProps) ProjectionSelector_defineProperties(Constructor.prototype, protoProps);
      if (staticProps) ProjectionSelector_defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }

    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File gui/ProjectionSelector.js
     *
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var ProjectionSelector = /*#__PURE__*/ (function () {
      // Constructor
      function ProjectionSelector(parentDiv, aladin) {
        ProjectionSelector_classCallCheck(this, ProjectionSelector);

        this.aladin = aladin;
        this.mainDiv = document.createElement("div");
        this.mainDiv.classList.add("aladin-projSelection");
        parentDiv.appendChild(this.mainDiv);

        this._createComponent();

        this._addListeners();
      }

      ProjectionSelector_createClass(ProjectionSelector, [
        {
          key: "_createComponent",
          value: function _createComponent() {
            var _this = this;

            $(this.mainDiv).append('<select title="Projection"></select>');
            this.selectProjection = $(this.mainDiv).find("select");
            this.selectProjection.empty();
            ["SIN", "AIT", "MOL", "MER", "ARC", "TAN", "HPX"].forEach(function (p) {
              _this.selectProjection.append(
                $("<option />")
                  .attr("selected", p == _this.aladin.projection)
                  .val(p)
                  .text(p)
              );
            });
            var self = this;
            this.selectProjection.change(function () {
              self.aladin.setProjection($(this).val());
            });
          },
        },
        {
          key: "_addListeners",
          value: function _addListeners() {
            var self = this;
            ALEvent.PROJECTION_CHANGED.listenedBy(this.aladin.aladinDiv, function (e) {
              self.selectProjection.val(e.detail.projection);
            });
          },
        },
        {
          key: "show",
          value: function show() {
            this.mainDiv.style.display = "block";
          },
        },
        {
          key: "hide",
          value: function hide() {
            this.mainDiv.style.display = "none";
          },
        },
      ]);

      return ProjectionSelector;
    })(); // CONCATENATED MODULE: ./src/js/MocServer.js
    function MocServer_typeof(obj) {
      "@babel/helpers - typeof";
      return (
        (MocServer_typeof =
          "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
            ? function (obj) {
                return typeof obj;
              }
            : function (obj) {
                return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
              }),
        MocServer_typeof(obj)
      );
    }

    function MocServer_regeneratorRuntime() {
      "use strict";
      /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ MocServer_regeneratorRuntime =
        function _regeneratorRuntime() {
          return exports;
        };
      var exports = {},
        Op = Object.prototype,
        hasOwn = Op.hasOwnProperty,
        $Symbol = "function" == typeof Symbol ? Symbol : {},
        iteratorSymbol = $Symbol.iterator || "@@iterator",
        asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
        toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
      function define(obj, key, value) {
        return (
          Object.defineProperty(obj, key, {
            value: value,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          }),
          obj[key]
        );
      }
      try {
        define({}, "");
      } catch (err) {
        define = function define(obj, key, value) {
          return (obj[key] = value);
        };
      }
      function wrap(innerFn, outerFn, self, tryLocsList) {
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
          generator = Object.create(protoGenerator.prototype),
          context = new Context(tryLocsList || []);
        return (
          (generator._invoke = (function (innerFn, self, context) {
            var state = "suspendedStart";
            return function (method, arg) {
              if ("executing" === state) throw new Error("Generator is already running");
              if ("completed" === state) {
                if ("throw" === method) throw arg;
                return doneResult();
              }
              for (context.method = method, context.arg = arg; ; ) {
                var delegate = context.delegate;
                if (delegate) {
                  var delegateResult = maybeInvokeDelegate(delegate, context);
                  if (delegateResult) {
                    if (delegateResult === ContinueSentinel) continue;
                    return delegateResult;
                  }
                }
                if ("next" === context.method) context.sent = context._sent = context.arg;
                else if ("throw" === context.method) {
                  if ("suspendedStart" === state) throw ((state = "completed"), context.arg);
                  context.dispatchException(context.arg);
                } else "return" === context.method && context.abrupt("return", context.arg);
                state = "executing";
                var record = tryCatch(innerFn, self, context);
                if ("normal" === record.type) {
                  if (((state = context.done ? "completed" : "suspendedYield"), record.arg === ContinueSentinel)) continue;
                  return { value: record.arg, done: context.done };
                }
                "throw" === record.type && ((state = "completed"), (context.method = "throw"), (context.arg = record.arg));
              }
            };
          })(innerFn, self, context)),
          generator
        );
      }
      function tryCatch(fn, obj, arg) {
        try {
          return { type: "normal", arg: fn.call(obj, arg) };
        } catch (err) {
          return { type: "throw", arg: err };
        }
      }
      exports.wrap = wrap;
      var ContinueSentinel = {};
      function Generator() {}
      function GeneratorFunction() {}
      function GeneratorFunctionPrototype() {}
      var IteratorPrototype = {};
      define(IteratorPrototype, iteratorSymbol, function () {
        return this;
      });
      var getProto = Object.getPrototypeOf,
        NativeIteratorPrototype = getProto && getProto(getProto(values([])));
      NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol) &&
        (IteratorPrototype = NativeIteratorPrototype);
      var Gp = (GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype));
      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function (method) {
          define(prototype, method, function (arg) {
            return this._invoke(method, arg);
          });
        });
      }
      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);
          if ("throw" !== record.type) {
            var result = record.arg,
              value = result.value;
            return value && "object" == MocServer_typeof(value) && hasOwn.call(value, "__await")
              ? PromiseImpl.resolve(value.__await).then(
                  function (value) {
                    invoke("next", value, resolve, reject);
                  },
                  function (err) {
                    invoke("throw", err, resolve, reject);
                  }
                )
              : PromiseImpl.resolve(value).then(
                  function (unwrapped) {
                    (result.value = unwrapped), resolve(result);
                  },
                  function (error) {
                    return invoke("throw", error, resolve, reject);
                  }
                );
          }
          reject(record.arg);
        }
        var previousPromise;
        this._invoke = function (method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }
          return (previousPromise = previousPromise
            ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg)
            : callInvokeWithMethodAndArg());
        };
      }
      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];
        if (undefined === method) {
          if (((context.delegate = null), "throw" === context.method)) {
            if (
              delegate.iterator["return"] &&
              ((context.method = "return"), (context.arg = undefined), maybeInvokeDelegate(delegate, context), "throw" === context.method)
            )
              return ContinueSentinel;
            (context.method = "throw"), (context.arg = new TypeError("The iterator does not provide a 'throw' method"));
          }
          return ContinueSentinel;
        }
        var record = tryCatch(method, delegate.iterator, context.arg);
        if ("throw" === record.type) return (context.method = "throw"), (context.arg = record.arg), (context.delegate = null), ContinueSentinel;
        var info = record.arg;
        return info
          ? info.done
            ? ((context[delegate.resultName] = info.value),
              (context.next = delegate.nextLoc),
              "return" !== context.method && ((context.method = "next"), (context.arg = undefined)),
              (context.delegate = null),
              ContinueSentinel)
            : info
          : ((context.method = "throw"),
            (context.arg = new TypeError("iterator result is not an object")),
            (context.delegate = null),
            ContinueSentinel);
      }
      function pushTryEntry(locs) {
        var entry = { tryLoc: locs[0] };
        1 in locs && (entry.catchLoc = locs[1]), 2 in locs && ((entry.finallyLoc = locs[2]), (entry.afterLoc = locs[3])), this.tryEntries.push(entry);
      }
      function resetTryEntry(entry) {
        var record = entry.completion || {};
        (record.type = "normal"), delete record.arg, (entry.completion = record);
      }
      function Context(tryLocsList) {
        (this.tryEntries = [{ tryLoc: "root" }]), tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
      }
      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];
          if (iteratorMethod) return iteratorMethod.call(iterable);
          if ("function" == typeof iterable.next) return iterable;
          if (!isNaN(iterable.length)) {
            var i = -1,
              next = function next() {
                for (; ++i < iterable.length; ) {
                  if (hasOwn.call(iterable, i)) return (next.value = iterable[i]), (next.done = !1), next;
                }
                return (next.value = undefined), (next.done = !0), next;
              };
            return (next.next = next);
          }
        }
        return { next: doneResult };
      }
      function doneResult() {
        return { value: undefined, done: !0 };
      }
      return (
        (GeneratorFunction.prototype = GeneratorFunctionPrototype),
        define(Gp, "constructor", GeneratorFunctionPrototype),
        define(GeneratorFunctionPrototype, "constructor", GeneratorFunction),
        (GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction")),
        (exports.isGeneratorFunction = function (genFun) {
          var ctor = "function" == typeof genFun && genFun.constructor;
          return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
        }),
        (exports.mark = function (genFun) {
          return (
            Object.setPrototypeOf
              ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype)
              : ((genFun.__proto__ = GeneratorFunctionPrototype), define(genFun, toStringTagSymbol, "GeneratorFunction")),
            (genFun.prototype = Object.create(Gp)),
            genFun
          );
        }),
        (exports.awrap = function (arg) {
          return { __await: arg };
        }),
        defineIteratorMethods(AsyncIterator.prototype),
        define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
          return this;
        }),
        (exports.AsyncIterator = AsyncIterator),
        (exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
          void 0 === PromiseImpl && (PromiseImpl = Promise);
          var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
          return exports.isGeneratorFunction(outerFn)
            ? iter
            : iter.next().then(function (result) {
                return result.done ? result.value : iter.next();
              });
        }),
        defineIteratorMethods(Gp),
        define(Gp, toStringTagSymbol, "Generator"),
        define(Gp, iteratorSymbol, function () {
          return this;
        }),
        define(Gp, "toString", function () {
          return "[object Generator]";
        }),
        (exports.keys = function (object) {
          var keys = [];
          for (var key in object) {
            keys.push(key);
          }
          return (
            keys.reverse(),
            function next() {
              for (; keys.length; ) {
                var key = keys.pop();
                if (key in object) return (next.value = key), (next.done = !1), next;
              }
              return (next.done = !0), next;
            }
          );
        }),
        (exports.values = values),
        (Context.prototype = {
          constructor: Context,
          reset: function reset(skipTempReset) {
            if (
              ((this.prev = 0),
              (this.next = 0),
              (this.sent = this._sent = undefined),
              (this.done = !1),
              (this.delegate = null),
              (this.method = "next"),
              (this.arg = undefined),
              this.tryEntries.forEach(resetTryEntry),
              !skipTempReset)
            )
              for (var name in this) {
                "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
              }
          },
          stop: function stop() {
            this.done = !0;
            var rootRecord = this.tryEntries[0].completion;
            if ("throw" === rootRecord.type) throw rootRecord.arg;
            return this.rval;
          },
          dispatchException: function dispatchException(exception) {
            if (this.done) throw exception;
            var context = this;
            function handle(loc, caught) {
              return (
                (record.type = "throw"),
                (record.arg = exception),
                (context.next = loc),
                caught && ((context.method = "next"), (context.arg = undefined)),
                !!caught
              );
            }
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i],
                record = entry.completion;
              if ("root" === entry.tryLoc) return handle("end");
              if (entry.tryLoc <= this.prev) {
                var hasCatch = hasOwn.call(entry, "catchLoc"),
                  hasFinally = hasOwn.call(entry, "finallyLoc");
                if (hasCatch && hasFinally) {
                  if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
                  if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
                } else if (hasCatch) {
                  if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
                } else {
                  if (!hasFinally) throw new Error("try statement without catch or finally");
                  if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
                }
              }
            }
          },
          abrupt: function abrupt(type, arg) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                var finallyEntry = entry;
                break;
              }
            }
            finallyEntry &&
              ("break" === type || "continue" === type) &&
              finallyEntry.tryLoc <= arg &&
              arg <= finallyEntry.finallyLoc &&
              (finallyEntry = null);
            var record = finallyEntry ? finallyEntry.completion : {};
            return (
              (record.type = type),
              (record.arg = arg),
              finallyEntry ? ((this.method = "next"), (this.next = finallyEntry.finallyLoc), ContinueSentinel) : this.complete(record)
            );
          },
          complete: function complete(record, afterLoc) {
            if ("throw" === record.type) throw record.arg;
            return (
              "break" === record.type || "continue" === record.type
                ? (this.next = record.arg)
                : "return" === record.type
                ? ((this.rval = this.arg = record.arg), (this.method = "return"), (this.next = "end"))
                : "normal" === record.type && afterLoc && (this.next = afterLoc),
              ContinueSentinel
            );
          },
          finish: function finish(finallyLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
            }
          },
          catch: function _catch(tryLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc === tryLoc) {
                var record = entry.completion;
                if ("throw" === record.type) {
                  var thrown = record.arg;
                  resetTryEntry(entry);
                }
                return thrown;
              }
            }
            throw new Error("illegal catch attempt");
          },
          delegateYield: function delegateYield(iterable, resultName, nextLoc) {
            return (
              (this.delegate = {
                iterator: values(iterable),
                resultName: resultName,
                nextLoc: nextLoc,
              }),
              "next" === this.method && (this.arg = undefined),
              ContinueSentinel
            );
          },
        }),
        exports
      );
    }

    function MocServer_asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }
      if (info.done) {
        resolve(value);
      } else {
        Promise.resolve(value).then(_next, _throw);
      }
    }

    function MocServer_asyncToGenerator(fn) {
      return function () {
        var self = this,
          args = arguments;
        return new Promise(function (resolve, reject) {
          var gen = fn.apply(self, args);
          function _next(value) {
            MocServer_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }
          function _throw(err) {
            MocServer_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }
          _next(undefined);
        });
      };
    }

    function MocServer_classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function MocServer_defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function MocServer_createClass(Constructor, protoProps, staticProps) {
      if (protoProps) MocServer_defineProperties(Constructor.prototype, protoProps);
      if (staticProps) MocServer_defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }

    function MocServer_defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true,
        });
      } else {
        obj[key] = value;
      }
      return obj;
    }

    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File MocServer
     *
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/
    var MocServer = /*#__PURE__*/ (function () {
      function MocServer() {
        MocServer_classCallCheck(this, MocServer);
      }

      MocServer_createClass(MocServer, null, [
        {
          key: "getAllHiPSes",
          value: function getAllHiPSes() {
            var _this = this;

            if (this._allHiPSes === undefined) {
              MocServer_asyncToGenerator(
                /*#__PURE__*/ MocServer_regeneratorRuntime().mark(function _callee() {
                  return MocServer_regeneratorRuntime().wrap(function _callee$(_context) {
                    while (1) {
                      switch ((_context.prev = _context.next)) {
                        case 0:
                          _context.next = 2;
                          return fetch(
                            "https://alasky.cds.unistra.fr/MocServer/query?expr=dataproduct_type%3Dimage+%7C%7C%A0dataproduct_type%3Dcube&get=record&fmt=json&fields=ID,hips_initial_fov,hips_initial_ra,hips_initial_dec,hips_pixel_bitpix,hips_creator,hips_copyright,hips_frame,hips_order,hips_order_min,hips_tile_width,hips_tile_format,hips_pixel_cut,obs_title,obs_description,obs_copyright,obs_regime,hips_data_range,hips_service_url"
                          ).then(function (response) {
                            return response.json();
                          });

                        case 2:
                          _this._allHiPSes = _context.sent;

                        case 3:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                })
              )();
            }

            return this._allHiPSes;
          },
        },
        {
          key: "getAllCatalogHiPSes",
          value: function getAllCatalogHiPSes() {
            var _this2 = this;

            if (this._allCatalogHiPSes === undefined) {
              MocServer_asyncToGenerator(
                /*#__PURE__*/ MocServer_regeneratorRuntime().mark(function _callee2() {
                  return MocServer_regeneratorRuntime().wrap(function _callee2$(_context2) {
                    while (1) {
                      switch ((_context2.prev = _context2.next)) {
                        case 0:
                          _context2.next = 2;
                          return fetch(
                            "https://alasky.cds.unistra.fr/MocServer/query?expr=dataproduct_type%3Dcatalog&get=record&fmt=json&fields=ID,hips_copyright,hips_order,hips_order_min,obs_title,obs_description,obs_copyright,obs_regime,cs_service_url,hips_service_url"
                          ).then(function (response) {
                            return response.json();
                          });

                        case 2:
                          _this2._allCatalogHiPSes = _context2.sent;

                        case 3:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2);
                })
              )();
            }

            return this._allCatalogHiPSes;
          },
        },
      ]);

      return MocServer;
    })();

    MocServer_defineProperty(MocServer, "_allHiPSes", undefined);

    MocServer_defineProperty(MocServer, "_allCatalogHiPSes", undefined);
    // EXTERNAL MODULE: ./node_modules/autocompleter/autocomplete.js
    var autocomplete = __webpack_require__(7338);
    var autocomplete_default = /*#__PURE__*/ __webpack_require__.n(autocomplete); // CONCATENATED MODULE: ./src/js/gui/CatalogSelector.js
    function CatalogSelector_slicedToArray(arr, i) {
      return (
        CatalogSelector_arrayWithHoles(arr) ||
        CatalogSelector_iterableToArrayLimit(arr, i) ||
        CatalogSelector_unsupportedIterableToArray(arr, i) ||
        CatalogSelector_nonIterableRest()
      );
    }

    function CatalogSelector_nonIterableRest() {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
      );
    }

    function CatalogSelector_unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return CatalogSelector_arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return CatalogSelector_arrayLikeToArray(o, minLen);
    }

    function CatalogSelector_arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }

    function CatalogSelector_iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator]) || arr["@@iterator"];
      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;
      var _s, _e;
      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }

    function CatalogSelector_arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function CatalogSelector_classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function CatalogSelector_defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function CatalogSelector_createClass(Constructor, protoProps, staticProps) {
      if (protoProps) CatalogSelector_defineProperties(Constructor.prototype, protoProps);
      if (staticProps) CatalogSelector_defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }

    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File gui/CatalogSelector.js
     *
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var CatalogSelector = /*#__PURE__*/ (function () {
      function CatalogSelector(parentDiv, aladin, fnIdSelected) {
        CatalogSelector_classCallCheck(this, CatalogSelector);

        this.parentDiv = parentDiv;
        this.aladin = aladin;
        this.fnIdSelected = fnIdSelected;

        this._createComponent();
      }

      CatalogSelector_createClass(CatalogSelector, [
        {
          key: "_createComponent",
          value: function _createComponent() {
            var self = this;
            this.mainDiv = document.createElement("div");
            this.mainDiv.classList.add("aladin-dialog", "aladin-cb-list");
            this.mainDiv.style.display = "block";
            var autocompleteId = "autocomplete-" + Utils.uuidv4();
            this.mainDiv.insertAdjacentHTML(
              "afterbegin",
              '<a class="aladin-closeBtn">&times;</a>' +
                '<div class="aladin-box-title">Select Catalogue:</div>' +
                '<div class="aladin-box-content">' +
                '<div class="aladin-label" for="' +
                autocompleteId +
                '">By ID, title, keyword</div>' +
                '<input style="width:100%;" name="' +
                autocompleteId +
                '" id="' +
                autocompleteId +
                '" type="text" placeholder="Type keyword or VOTable URL" />' +
                '<div class="aladin-row" style="font-size: 12px;">' +
                '<div class="cone-search aladin-col">' +
                '<div><input type="number" value="1.0" style="width: 4em;" maxlength="5" size="5"> <select style="padding: 4px 0!important;"><option>deg<option>arcmin<option>arcsec</select> around view center</div>' +
                '<div>Limit to <input type="number" min="1" max="10000" value="1000" style="width: 5em;"> sources</div>' +
                "</div>" +
                "</div>" +
                '<div class="aladin-row">' +
                '<div class="cone-search aladin-col">' +
                '<div><button class="aladin-btn">Load cone</button></div>' +
                "</div>" +
                '<div class="hips aladin-col"><button class="aladin-btn">Load catalogue HiPS</button></div>' +
                "</div>" +
                '<div class="aladin-box-separator"></div>' +
                '<div class="aladin-label" for="' +
                autocompleteId +
                '">By VOTable URL</div>' +
                '<input style="width:100%;" name="' +
                autocompleteId +
                '" id="' +
                autocompleteId +
                '" type="text" placeholder="Enter VOTable URL" />' +
                '<div class="votable"><button class="aladin-btn">Load VOTable</button></div>' +
                "</div>"
            );
            this.parentDiv.appendChild(this.mainDiv);
            this.idInput = self.mainDiv.querySelectorAll("input")[0];
            this.votInput = self.mainDiv.querySelectorAll("input")[3];

            var _this$mainDiv$querySe = this.mainDiv.querySelectorAll(".aladin-btn"),
              _this$mainDiv$querySe2 = CatalogSelector_slicedToArray(_this$mainDiv$querySe, 3),
              loadCSBtn = _this$mainDiv$querySe2[0],
              loadHiPSBtn = _this$mainDiv$querySe2[1],
              loadVOTableBtn = _this$mainDiv$querySe2[2];

            this.divCS = this.mainDiv.querySelector(".cone-search");
            this.divLoadHiPS = this.mainDiv.querySelector(".hips");
            this.divLoadHiPS.style.display = "none"; // retrieve cone search div and load HiPS div
            //this.divCS = this.mainDiv.querySelector('div > div:nth-child(5) > div:nth-child(1) > div > div.col-start-1');
            //this.divLoadHiPS = this.mainDiv.querySelector('div > div:nth-child(5) > div:nth-child(1) > div > div.col-start-9');
            //$(this.divCS).hide();
            //$(this.divLoadHiPS).hide();
            // listener to load CS data
            //const loadCSBtn = this.divCS.querySelector('div:nth-child(1) > button');

            $(loadCSBtn).click(function () {
              var radius = parseFloat(self.divCS.querySelector("div:nth-child(1) > input").value);
              var radiusUnit = self.divCS.querySelector("div:nth-child(1) > select").value;
              var radiusDeg = radius;

              if (radiusUnit == "arcmin") {
                radiusDeg /= 60.0;
              } else if (radiusUnit == "arcsec") {
                radiusDeg /= 3600.0;
              }

              var maxNbSources = parseInt(self.divCS.querySelector("div:nth-child(2) > input").value);
              var baseURL = self.selectedItem.cs_service_url;

              var _self$aladin$getRaDec = self.aladin.getRaDec(),
                _self$aladin$getRaDec2 = CatalogSelector_slicedToArray(_self$aladin$getRaDec, 2),
                ra = _self$aladin$getRaDec2[0],
                dec = _self$aladin$getRaDec2[1];

              self.fnIdSelected &&
                self.fnIdSelected("coneSearch", {
                  id: self.idInput.value,
                  baseURL: baseURL,
                  limit: maxNbSources,
                  radiusDeg: radiusDeg,
                  ra: ra,
                  dec: dec,
                });
            }); // listener to load HiPS catalogue
            //const loadHiPSBtn = this.divLoadHiPS.querySelector('button');

            $(loadHiPSBtn).click(function () {
              self.fnIdSelected &&
                self.fnIdSelected("hips", {
                  id: self.idInput.value,
                  hipsURL: self.selectedItem.hips_service_url,
                });
            }); // listener to load catalogue from VOTable URL
            //const loadVOTableBtn = document.querySelector('div > div:nth-child(5) > div:nth-child(2) > div > button');

            $(loadVOTableBtn).click(function () {
              self.fnIdSelected &&
                self.fnIdSelected("votable", {
                  url: self.votInput.value,
                });
            }); // setup autocomplete

            var input = document.getElementById(autocompleteId); // Query the mocserver

            MocServer.getAllCatalogHiPSes();
            autocomplete_default()({
              input: input,
              minLength: 3,
              fetch: function fetch(text, update) {
                text = text.toLowerCase();

                var filterCats = function filterCats(item) {
                  var ID = item.ID;
                  var obsTitle = item.obs_title || "";
                  var obsDescription = item.obs_description || "";
                  return ID.toLowerCase().includes(text) || obsTitle.toLowerCase().includes(text) || obsDescription.toLowerCase().includes(text);
                }; // filter suggestions

                var suggestions = MocServer.getAllCatalogHiPSes().filter(filterCats); // sort suggestions

                suggestions.sort(function (a, b) {
                  var scoreForA = 0;
                  var scoreForB = 0;

                  if (a.ID.toLowerCase().includes(text)) {
                    scoreForA += 100;
                  }

                  if (b.ID.toLowerCase().includes(text)) {
                    scoreForB += 100;
                  }

                  if (a.obs_title.toLowerCase().includes(text)) {
                    scoreForA += 50;
                  }

                  if (b.obs_title.toLowerCase().includes(text)) {
                    scoreForB += 50;
                  }

                  if (a.obs_description.toLowerCase().includes(text)) {
                    scoreForA += 10;
                  }

                  if (b.obs_description.toLowerCase().includes(text)) {
                    scoreForB += 10;
                  } // HiPS catalogue available

                  if (a.hips_service_url) {
                    scoreForA += 20;
                  }

                  if (b.hips_service_url) {
                    scoreForB += 20;
                  }

                  if (scoreForA > scoreForB) {
                    return -1;
                  }

                  if (scoreForB > scoreForA) {
                    return 1;
                  }

                  return 0;
                }); // limit to 50 first suggestions

                var returnedSuggestions = suggestions.slice(0, 50);
                update(returnedSuggestions);
              },
              onSelect: function onSelect(item) {
                // adapt UI to selected catalogue
                if (item.cs_service_url) {
                  $(self.divCS).show();
                } else {
                  $(self.divCS).hide();
                }

                if (item.hips_service_url) {
                  $(self.divLoadHiPS).show();
                } else {
                  $(self.divLoadHiPS).hide();
                }

                input.value = item.ID;
                self.selectedItem = item;
              },
              render: function render(item, currentValue) {
                var itemElement = document.createElement("div");
                itemElement.innerHTML = (item.obs_title || "") + " - " + '<span style="color: #ae8de1">' + item.ID + "</span>";
                return itemElement;
              },
            }); // this modal is closed when clicking on the cross at the top right, or on the Cancel button

            var _this$mainDiv$querySe3 = this.mainDiv.querySelectorAll(".aladin-closeBtn"),
              _this$mainDiv$querySe4 = CatalogSelector_slicedToArray(_this$mainDiv$querySe3, 1),
              closeBtn = _this$mainDiv$querySe4[0];

            $(closeBtn).click(function () {
              self.hide();
            });
          },
        },
        {
          key: "show",
          value: function show() {
            this.mainDiv.style.display = "block";
            /*
      // focus on text field
      let byIdSelected = $(this.mainDiv.querySelectorAll('div div a')[0]).hasClass('tab-active');
      if (byIdSelected) {
          let idInput = this.mainDiv.querySelectorAll('div div .p-4')[0].querySelector('input');
          idInput.focus();
      }
      else {
          let urlInput = this.mainDiv.querySelectorAll('div div .p-4')[1].querySelector('input');
          urlInput.focus();
      }*/
          },
        },
        {
          key: "hide",
          value: function hide() {
            this.mainDiv.style.display = "none";
          },
        },
      ]);

      return CatalogSelector;
    })(); // CONCATENATED MODULE: ./src/js/gui/HiPSSelector.js
    function HiPSSelector_slicedToArray(arr, i) {
      return (
        HiPSSelector_arrayWithHoles(arr) ||
        HiPSSelector_iterableToArrayLimit(arr, i) ||
        HiPSSelector_unsupportedIterableToArray(arr, i) ||
        HiPSSelector_nonIterableRest()
      );
    }

    function HiPSSelector_nonIterableRest() {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
      );
    }

    function HiPSSelector_unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return HiPSSelector_arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return HiPSSelector_arrayLikeToArray(o, minLen);
    }

    function HiPSSelector_arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }

    function HiPSSelector_iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator]) || arr["@@iterator"];
      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;
      var _s, _e;
      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }

    function HiPSSelector_arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function HiPSSelector_classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function HiPSSelector_defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function HiPSSelector_createClass(Constructor, protoProps, staticProps) {
      if (protoProps) HiPSSelector_defineProperties(Constructor.prototype, protoProps);
      if (staticProps) HiPSSelector_defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }

    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File gui/HiPSSelector.js
     *
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var HiPSSelector = /*#__PURE__*/ (function () {
      function HiPSSelector(parentDiv, fnIdSelected, aladin) {
        HiPSSelector_classCallCheck(this, HiPSSelector);

        this.parentDiv = parentDiv;
        this.fnIdSelected = fnIdSelected;
        this.aladin = aladin;

        this._createComponent();
      }

      HiPSSelector_createClass(HiPSSelector, [
        {
          key: "_createComponent",
          value: function _createComponent() {
            var self = this;
            this.mainDiv = document.createElement("div");
            this.mainDiv.style.display = "block";
            this.mainDiv.classList.add("aladin-dialog", "aladin-layerBox", "aladin-cb-list");
            var autocompleteId = "autocomplete-" + Utils.uuidv4();
            this.mainDiv.insertAdjacentHTML(
              "afterbegin",
              '<a class="aladin-closeBtn">&times;</a>' +
                '<div class="aladin-box-title">Select image HiPS:</div>' +
                '<div class="aladin-box-content">' +
                '<div class="aladin-label" for="' +
                autocompleteId +
                '">By ID, title, keyword or URL</div>' +
                '<input name="' +
                autocompleteId +
                '" id="' +
                autocompleteId +
                '" type="text" placeholder="Type ID, title, keyword or URL" /><br>' +
                "<div>" +
                '<button class="aladin-btn">Select HiPS</button>' +
                '<button class="aladin-btn">Load coverage</button>' +
                "</div>" +
                "</div>"
            );
            this.parentDiv.appendChild(this.mainDiv); // setup autocomplete

            var input = document.getElementById(autocompleteId); // Query the mocserver

            MocServer.getAllHiPSes();
            autocomplete_default()({
              input: input,
              fetch: function fetch(text, update) {
                text = text.toLowerCase(); // filter suggestions

                var suggestions = MocServer.getAllHiPSes().filter(function (n) {
                  return n.ID.toLowerCase().includes(text) || n.obs_title.toLowerCase().includes(text);
                }); // sort suggestions

                suggestions.sort(function (a, b) {
                  var scoreForA = 0;
                  var scoreForB = 0;

                  if (a.ID.toLowerCase().includes(text)) {
                    scoreForA += 100;
                  }

                  if (b.ID.toLowerCase().includes(text)) {
                    scoreForB += 100;
                  }

                  if (a.obs_title.toLowerCase().includes(text)) {
                    scoreForA += 50;
                  }

                  if (b.obs_title.toLowerCase().includes(text)) {
                    scoreForB += 50;
                  }

                  if (a.obs_description && a.obs_description.toLowerCase().includes(text)) {
                    scoreForA += 10;
                  }

                  if (b.obs_description && b.obs_description.toLowerCase().includes(text)) {
                    scoreForB += 10;
                  }

                  if (scoreForA > scoreForB) {
                    return -1;
                  }

                  if (scoreForB > scoreForA) {
                    return 1;
                  }

                  return 0;
                }); // limit to 50 first suggestions

                var returnedSuggestions = suggestions.slice(0, 50);
                update(returnedSuggestions);
              },
              onSelect: function onSelect(item) {
                self.selectedItem = item;
                input.value = item.ID;
                self.fnIdSelected && self.fnIdSelected(item.ID);
              },
              render: function render(item, currentValue) {
                var itemElement = document.createElement("div");
                itemElement.innerHTML = item.obs_title + " - " + '<span style="color: #ae8de1">' + item.ID + "</span>";
                return itemElement;
              },
            }); // this modal is closed when clicking on the cross at the top right

            var _this$mainDiv$querySe = this.mainDiv.querySelectorAll(".aladin-btn"),
              _this$mainDiv$querySe2 = HiPSSelector_slicedToArray(_this$mainDiv$querySe, 2),
              selectBtn = _this$mainDiv$querySe2[0],
              loadMOCBtn = _this$mainDiv$querySe2[1];

            var _this$mainDiv$querySe3 = this.mainDiv.querySelectorAll(".aladin-closeBtn"),
              _this$mainDiv$querySe4 = HiPSSelector_slicedToArray(_this$mainDiv$querySe3, 1),
              closeBtn = _this$mainDiv$querySe4[0];

            $(closeBtn).click(function () {
              self.hide();
            }); // when 'Select' is pressed, call the callbacks

            $(selectBtn).click(function () {
              var byIdSelected = self.mainDiv.querySelectorAll("input")[0];

              if (byIdSelected) {
                self.fnIdSelected && self.fnIdSelected(byIdSelected.value);
              }

              byIdSelected.value = ""; //self.hide();
            });
            $(loadMOCBtn).click(function () {
              var url;
              var byIdSelected = self.mainDiv.querySelectorAll("input")[0];

              if (byIdSelected.value.startsWith("http")) {
                url = byIdSelected.value + "/Moc.fits";
              } else {
                url = self.selectedItem.hips_service_url + "/Moc.fits";
              }

              if (url.includes("alasky")) {
                url = url.replace("http:", "https:");
              }

              var moc = A.MOCFromURL(url);
              self.aladin.addMOC(moc);
            });
          },
        },
        {
          key: "show",
          value: funczion show() {
            this.mainDiv.style.display = "block";
            /*
      // focus on text field
      let byIdSelected = $(this.mainDiv.querySelectorAll('div div a')[0]).hasClass('tab-active');
      if (byIdSelected) {
          let idInput = this.mainDiv.querySelectorAll('div div .p-4')[0].querySelector('input');
          idInput.focus();
      }
      else {
          let urlInput = this.mainDiv.querySelectorAll('div div .p-4')[1].querySelector('input');
          urlInput.focus();
      }*/
          },
        },
        {
          key: "hide",
          value: function hide() {
            this.mainDiv.style.display = "none";
          },
        },
      ]);

      return HiPSSelector;
    })(); // CONCATENATED MODULE: ./src/js/gui/HiPSLayer.js
    function HiPSLayer_slicedToArray(arr, i) {
      return (
        HiPSLayer_arrayWithHoles(arr) ||
        HiPSLayer_iterableToArrayLimit(arr, i) ||
        HiPSLayer_unsupportedIterableToArray(arr, i) ||
        HiPSLayer_nonIterableRest()
      );
    }

    function HiPSLayer_nonIterableRest() {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
      );
    }

    function HiPSLayer_iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator]) || arr["@@iterator"];
      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;
      var _s, _e;
      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }

    function HiPSLayer_arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _createForOfIteratorHelper(o, allowArrayLike) {
      var it = (typeof Symbol !== "undefined" && o[Symbol.iterator]) || o["@@iterator"];
      if (!it) {
        if (Array.isArray(o) || (it = HiPSLayer_unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === "number")) {
          if (it) o = it;
          var i = 0;
          var F = function F() {};
          return {
            s: F,
            n: function n() {
              if (i >= o.length) return { done: true };
              return { done: false, value: o[i++] };
            },
            e: function e(_e2) {
              throw _e2;
            },
            f: F,
          };
        }
        throw new TypeError(
          "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
        );
      }
      var normalCompletion = true,
        didErr = false,
        err;
      return {
        s: function s() {
          it = it.call(o);
        },
        n: function n() {
          var step = it.next();
          normalCompletion = step.done;
          return step;
        },
        e: function e(_e3) {
          didErr = true;
          err = _e3;
        },
        f: function f() {
          try {
            if (!normalCompletion && it["return"] != null) it["return"]();
          } finally {
            if (didErr) throw err;
          }
        },
      };
    }

    function HiPSLayer_unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return HiPSLayer_arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return HiPSLayer_arrayLikeToArray(o, minLen);
    }

    function HiPSLayer_arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }

    function HiPSLayer_classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function HiPSLayer_defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function HiPSLayer_createClass(Constructor, protoProps, staticProps) {
      if (protoProps) HiPSLayer_defineProperties(Constructor.prototype, protoProps);
      if (staticProps) HiPSLayer_defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }

    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File gui/Stack.js
     *
     *
     * Author: Matthieu Baumann[CDS]
     *
     *****************************************************************************/

    var HiPSLayer = /*#__PURE__*/ (function () {
      // Constructor
      function HiPSLayer(aladin, view, survey) {
        HiPSLayer_classCallCheck(this, HiPSLayer);

        this.aladin = aladin;
        this.view = view;
        this.survey = survey;
        this.hidden = false;
        this.lastOpacity = 1.0; // HiPS header div

        if (this.survey.layer === "base") {
          this.headerDiv = $(
            '<div class="aladin-layer-header-' +
              survey.layer +
              '">' +
              '<span class="indicator right-triangle">&nbsp;</span>' +
              '<select class="aladin-surveySelection"></select>' +
              '<button class="aladin-btn-small aladin-layer-hide" type="button" title="Hide this layer">👁️</button>' +
              '<button class="aladin-btn-small aladin-HiPSSelector" type="button" title="Search for a specific HiPS">🔍</button>' +
              "</div>"
          );
        } else {
          this.headerDiv = $(
            '<div class="aladin-layer-header-' +
              survey.layer +
              '">' +
              '<span class="indicator right-triangle">&nbsp;</span>' +
              '<select class="aladin-surveySelection"></select>' +
              '<button class="aladin-btn-small aladin-layer-hide" type="button" title="Hide this layer">👁️</button>' +
              '<button class="aladin-btn-small aladin-HiPSSelector" type="button" title="Search a specific HiPS">🔍</button>' +
              '<button class="aladin-btn-small aladin-delete-layer" type="button" title="Delete this layer">❌</button>' +
              "</div>"
          );
        } // HiPS main options div

        var cmListStr = "";

        var _iterator = _createForOfIteratorHelper(this.aladin.webglAPI.getAvailableColormapList()),
          _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            var cm = _step.value;
            cmListStr += "<option>" + cm + "</option>";
          } // Add the native which is special:
          // - for FITS hipses, it is changed to grayscale
          // - for JPG/PNG hipses, we do not use any colormap in the backend
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        this.nameRadioColorChoice = encodeURIComponent(Utils.uuidv4());
        cmListStr += "<option>native</option>";
        this.mainDiv = $(
          '<div class="aladin-frame" style="display: none;">' +
            '<table class="aladin-options"><tbody>' +
            '  <tr><td></td><td><label><input type="radio" class="colormap-color-selector" name="' +
            this.nameRadioColorChoice +
            '" id="colormap-radio" checked> Color map</label> <label><input type="radio" name="' +
            this.nameRadioColorChoice +
            '" value="color"> Color</label></td></tr>' +
            '  <tr><td></td><td><select class="colormap-selector">' +
            cmListStr +
            "</select></td></tr>" +
            '  <tr><td></td><td><input type="color" id="color-radio" name="color-radio" value="#ff0000" class="color-selector"></td></tr>' +
            '  <tr><td></td><td><label><input type="checkbox" class="reversed"> Reverse</label></td></tr>' +
            '  <tr><td>Stretch</td><td><select class="stretch"><option>Pow2</option><option selected>Linear</option><option>Sqrt</option><option>Asinh</option><option>Log</option></select></td></tr>' +
            '  <tr><td>Format</td><td><select class="format"></select></td></tr>' +
            '  <tr><td>Min cut</td><td><input type="number" class="min-cut"></td></tr>' +
            '  <tr><td>Max cut</td><td><input type="number" class="max-cut"></td></tr>' +
            '  <tr title="Add the color of different bandwidth HiPSes thanks to the additive mode"><td>Blending mode</td><td><select class="blending"><option>Additive</option><option selected>Default</option></select></td></tr>' +
            '  <tr><td>Opacity</td><td><input class="opacity" type="range" min="0" max="1" step="0.01"></td></tr>' +
            "</table> " +
            "</div>"
        );

        this._addListeners();

        this._updateHiPSLayerOptions();

        var self = this;

        this.layerChangedListener = function (e) {
          var survey = e.detail.survey;

          if (survey.layer === self.survey.layer) {
            // Update the survey to the new one
            self.survey = survey;

            self._updateHiPSLayerOptions();
          }

          self._updateSurveysDropdownList();
        };

        ALEvent.HIPS_LAYER_CHANGED.listenedBy(this.aladin.aladinDiv, this.layerChangedListener);
      }

      HiPSLayer_createClass(HiPSLayer, [
        {
          key: "destroy",
          value: function destroy() {
            ALEvent.HIPS_LAYER_CHANGED.remove(this.aladin.aladinDiv, this.layerChangedListener);
            this.mainDiv[0].removeEventListener("click", this.clickOnAladinFrameListener);
          },
        },
        {
          key: "_addListeners",
          value: function _addListeners() {
            var self = this; // HEADER DIV listeners
            // Click opener

            var clickOpener = this.headerDiv.find(".indicator");
            clickOpener.unbind("click");
            clickOpener.click(function () {
              if (clickOpener.hasClass("right-triangle")) {
                clickOpener.removeClass("right-triangle");
                clickOpener.addClass("down-triangle");
                self.mainDiv.slideDown(300);
                self.aladin.aladinDiv.dispatchEvent(
                  new CustomEvent("select-layer", {
                    detail: self.survey.layer,
                  })
                );
              } else {
                clickOpener.removeClass("down-triangle");
                clickOpener.addClass("right-triangle");
                self.mainDiv.slideUp(300);
              }
            }); // Click on aladin options should select the layer clicked

            var aladinOptionsFrame = self.mainDiv[0];

            this.clickOnAladinFrameListener = function (e) {
              self.aladin.aladinDiv.dispatchEvent(
                new CustomEvent("select-layer", {
                  detail: self.survey.layer,
                })
              );
            };

            aladinOptionsFrame.addEventListener("click", this.clickOnAladinFrameListener); // Update list of surveys

            self._updateSurveysDropdownList();

            var surveySelector = this.headerDiv.find(".aladin-surveySelection");
            surveySelector.unbind("change");
            surveySelector.change(function () {
              var cfg = HpxImageSurvey.SURVEYS[$(this)[0].selectedIndex];

              if (self.hidden) {
                cfg.options.opacity = 0.0;
              }

              var survey = self.aladin.createImageSurvey(cfg.id, cfg.name, cfg.url, undefined, cfg.maxOrder, cfg.options);
              self.aladin.setOverlayImageLayer(survey, self.survey.layer);
              self.aladin.aladinDiv.dispatchEvent(
                new CustomEvent("select-layer", {
                  detail: self.survey.layer,
                })
              );
            }); // Search HiPS button

            var hipsSelector = this.headerDiv.find(".aladin-HiPSSelector");
            hipsSelector.unbind("click");
            hipsSelector.click(function () {
              if (!self.hipsSelector) {
                self.hipsSelector = new HiPSSelector(
                  self.aladin.aladinDiv,
                  function (IDOrURL) {
                    var layerName = self.survey.layer;
                    self.aladin.setOverlayImageLayer(IDOrURL, layerName);
                  },
                  self.aladin
                );
              }

              self.hipsSelector.show();
            }); // Delete HiPS button

            var deleteLayer = this.headerDiv.find(".aladin-delete-layer");
            deleteLayer.unbind("click");
            deleteLayer.click(function () {
              var removeLayerEvent = new CustomEvent("remove-layer", {
                detail: self.survey.layer,
              });
              self.aladin.aladinDiv.dispatchEvent(removeLayerEvent);
            }); // Hide HiPS button

            var hideLayer = this.headerDiv.find(".aladin-layer-hide");
            hideLayer.unbind("click");
            hideLayer.click(function () {
              self.hidden = !self.hidden;
              var opacitySlider = self.mainDiv.find(".opacity").eq(0);
              var newOpacity = 0.0;

              if (self.hidden) {
                self.lastOpacity = self.survey.getOpacity();
                hideLayer.text("");
              } else {
                newOpacity = self.lastOpacity;
                hideLayer.text("👁️");
              } // Update the opacity slider

              opacitySlider.val(newOpacity);
              opacitySlider.get(0).disabled = self.hidden;
              self.survey.setOpacity(newOpacity); // Update HpxImageSurvey.SURVEYS definition

              /*const idxSelectedHiPS = self.headerDiv.find('.aladin-surveySelection')[0].selectedIndex;
        let surveyDef = HpxImageSurvey.SURVEYS[idxSelectedHiPS];
        let options = surveyDef.options || {};
        options.opacity = newOpacity;
        surveyDef.options = options;*/
            }); // MAIN DIV listeners
            // blending method

            if (self.survey.layer === "base") {
              this.mainDiv.find("tr").eq(8).hide();
            } else {
              var blendingSelector = this.mainDiv.find(".blending").eq(0);
              blendingSelector.unbind("change");
              blendingSelector.change(function () {
                var mode = blendingSelector.val();
                self.survey.setBlendingConfig(mode === "Additive");
              });
            } // image format

            var format4ImgLayer = this.mainDiv.find(".format").eq(0);
            var minCut4ImgLayer = this.mainDiv.find(".min-cut").eq(0);
            var maxCut4ImgLayer = this.mainDiv.find(".max-cut").eq(0);
            format4ImgLayer.unbind("change");
            format4ImgLayer.change(function () {
              var imgFormat = format4ImgLayer.val();
              self.survey.changeImageFormat(imgFormat);
              var minCut = 0;
              var maxCut = 255;

              if (imgFormat === "FITS") {
                // FITS format
                minCut = self.survey.properties.minCutout;
                maxCut = self.survey.properties.maxCutout;
              }

              self.survey.setCuts([minCut, maxCut]); // update the cuts only

              minCut4ImgLayer.val(parseFloat(minCut.toFixed(5)));
              maxCut4ImgLayer.val(parseFloat(maxCut.toFixed(5))); // update HpxImageSurvey.SURVEYS definition

              /*const idxSelectedHiPS = self.headerDiv.find('.aladin-surveySelection')[0].selectedIndex;
        let surveyDef = HpxImageSurvey.SURVEYS[idxSelectedHiPS];
        let options = surveyDef.options || {};
        options.minCut = minCut;
        options.maxCut = maxCut;
        options.imgFormat = imgFormat;
        surveyDef.options = options;*/
            }); // min/max cut

            minCut4ImgLayer.unbind("input blur");
            maxCut4ImgLayer.unbind("input blur");
            minCut4ImgLayer.add(maxCut4ImgLayer).on("input blur", function (e) {
              var minCutValue = parseFloat(minCut4ImgLayer.val());
              var maxCutValue = parseFloat(maxCut4ImgLayer.val());

              if (isNaN(minCutValue) || isNaN(maxCutValue)) {
                return;
              }

              self.survey.setCuts([minCutValue, maxCutValue]); // update HpxImageSurvey.SURVEYS definition

              /*const idxSelectedHiPS = self.surveySelectionDiv[0].selectedIndex;
        let surveyDef = HpxImageSurvey.SURVEYS[idxSelectedHiPS];
        let options = surveyDef.options || {};
        options.minCut = minCutValue;
        options.maxCut = maxCutValue;
        surveyDef.options = options;*/
            }); // colormap

            var colorMapSelect4ImgLayer = this.mainDiv.find(".colormap-selector").eq(0);
            var stretchSelect4ImgLayer = this.mainDiv.find(".stretch").eq(0);
            var reverseCmCb = this.mainDiv.find(".reversed").eq(0);
            var colorSelect4ImgLayer = self.mainDiv.find(".color-selector").eq(0);
            reverseCmCb.unbind("change");
            colorMapSelect4ImgLayer.unbind("change");
            stretchSelect4ImgLayer.unbind("change");
            var colorMode = this.mainDiv[0].getElementsByClassName("colormap-color-selector");
            colorMapSelect4ImgLayer
              .add(reverseCmCb)
              .add(stretchSelect4ImgLayer)
              .change(function () {
                var stretch = stretchSelect4ImgLayer.val();

                if (colorMode[0].checked) {
                  // Color map case
                  var cmap = colorMapSelect4ImgLayer.val();
                  var reverse = reverseCmCb[0].checked;
                  self.survey.setColormap(cmap, {
                    reversed: reverse,
                    stretch: stretch,
                  });
                } else {
                  // Single color case
                  var colorHex = colorSelect4ImgLayer.val();
                  var colorRgb = Color_Color.hexToRgb(colorHex);
                  self.survey.setColor([colorRgb.r / 255.0, colorRgb.g / 255.0, colorRgb.b / 255.0, 1.0], {
                    stretch: stretch,
                  });
                } // update HpxImageSurvey.SURVEYS definition

                /*const idxSelectedHiPS = self.headerDiv.find('.aladin-surveySelection')[0].selectedIndex;
        let surveyDef = HpxImageSurvey.SURVEYS[idxSelectedHiPS];
        let options = surveyDef.options || {};
        options.colormap = cmap;
        options.stretch = stretch;
        options.reversed = reverse;
        surveyDef.options = options;*/
              }); // Redefine the event for the newly added DOM

            colorSelect4ImgLayer.unbind("input");
            colorSelect4ImgLayer.on("input", function () {
              var colorHex = colorSelect4ImgLayer.val();
              var colorRgb = Color_Color.hexToRgb(colorHex);
              self.survey.setColor([colorRgb.r / 255.0, colorRgb.g / 255.0, colorRgb.b / 255.0, 1.0]);
            }); // colormap/color radio

            var colorMapTr = this.mainDiv.find("tr").eq(1);
            var colorTr = this.mainDiv.find("tr").eq(2);

            var _document$querySelect = document.querySelectorAll('input[name="' + this.nameRadioColorChoice + '"]'),
              _document$querySelect2 = HiPSLayer_slicedToArray(_document$querySelect, 2),
              colormapChoiceRadioBtn = _document$querySelect2[0],
              colorChoiceRadioBtn = _document$querySelect2[1];

            $(colormapChoiceRadioBtn).on("click", function (e) {
              // set the colormap
              var cmap = colorMapSelect4ImgLayer.val();
              self.survey.setColormap(cmap);
            });
            $(colorChoiceRadioBtn).on("click", function (e) {
              // set the color
              var colorHex = colorSelect4ImgLayer.val();
              var colorRgb = Color_Color.hexToRgb(colorHex);
              self.survey.setColor([colorRgb.r / 255.0, colorRgb.g / 255.0, colorRgb.b / 255.0, 1.0]);
            }); // opacity

            var opacity4ImgLayer = self.mainDiv.find(".opacity").eq(0);
            opacity4ImgLayer.unbind("input");
            opacity4ImgLayer.on("input", function () {
              var opacity = +opacity4ImgLayer.val();
              self.survey.setOpacity(opacity); // update HpxImageSurvey.SURVEYS definition

              /*const idxSelectedHiPS = self.headerDiv.find('.aladin-surveySelection')[0].selectedIndex;
        let surveyDef = HpxImageSurvey.SURVEYS[idxSelectedHiPS];
        let options = surveyDef.options || {};
        options.opacity = opacity;
        surveyDef.options = options;*/
            });
          },
        },
        {
          key: "_updateHiPSLayerOptions",
          value: function _updateHiPSLayerOptions() {
            var colorModeTr = this.mainDiv.find("tr").eq(0);
            var colorMapTr = this.mainDiv.find("tr").eq(1);
            var colorTr = this.mainDiv.find("tr").eq(2);
            var reverseTr = this.mainDiv.find("tr").eq(3);
            var stretchTr = this.mainDiv.find("tr").eq(4);
            var formatTr = this.mainDiv.find("tr").eq(5);
            var minCutTr = this.mainDiv.find("tr").eq(6);
            var maxCutTr = this.mainDiv.find("tr").eq(7);
            var colorMode = this.mainDiv.find(".colormap-color-selector").eq(0);
            var reverseCmCb = this.mainDiv.find(".reversed").eq(0);
            var colorMapSelect4ImgLayer = this.mainDiv.find(".colormap-selector").eq(0);
            var stretchSelect4ImgLayer = this.mainDiv.find(".stretch").eq(0);
            var formatSelect4ImgLayer = this.mainDiv.find(".format").eq(0);
            var opacity4ImgLayer = this.mainDiv.find(".opacity").eq(0);
            var minCut = this.mainDiv.find(".min-cut").eq(0);
            var maxCut = this.mainDiv.find(".max-cut").eq(0);
            formatSelect4ImgLayer.empty();
            this.survey.properties.formats.forEach(function (format) {
              formatSelect4ImgLayer.append(
                $("<option>", {
                  value: format,
                  text: format,
                })
              );
            });
            var options = this.survey.options;
            var colored = this.survey.colored;
            var imgFormat = options.imgFormat;
            formatSelect4ImgLayer.val(imgFormat); // cuts

            if (colored) {
              colorModeTr.hide();
              colorTr.hide();
              colorMapTr.hide();
              reverseTr.hide();
              stretchTr.hide();
              minCutTr.hide();
              maxCutTr.hide();
            } else {
              colorModeTr.show();

              if (!colorMode[0].checked) {
                colorTr.show();
                stretchTr.show();
                colorMapTr.hide();
                reverseTr.hide();
              } else {
                colorTr.hide();
                colorMapTr.show();
                reverseTr.show();
                stretchTr.show();
   6          }

              if (options.minCut) {
                if (parseFloat(minCut.val()) != options.minCut) {
                  minCut.val(parseFloat(options.minCut.toFixed(5)));
                }
              } else {
                minCut.val(0.0);
              }

              minCutTr.show();

              if (options.maxCut) {
                if (parseFloat(maxCut.val()) != options.maxCut) {
                  maxCut.val(parseFloat(options.maxCut.toFixed(5)));
                }
              } else {
                maxCut.val(10.0);
              }

              maxCutTr.show();
            }

            var opacity = options.opacity;
            opacity4ImgLayer.val(opacity); // TODO: traiter ce cas

            if (this.survey.colored) {
              return;
            }

            var cmap = options.colormap;
            var reverse = options.reversed;
            var stretch = options.stretch;
            reverseCmCb.prop("checked", reverse);
            colorMapSelect4ImgLayer.val(cmap);
            stretchSelect4ImgLayer.val(stretch);
          },
        },
        {
          key: "_updateSurveysDropdownList",
          value: function _updateSurveysDropdownList() {
            var _this = this;

            var surveySelectionDiv = this.headerDiv.find(".aladin-surveySelection");
            var surveys = HpxImageSurvey.SURVEYS.sort(function (a, b) {
              if (!a.order) {
                return a.id > b.id;
              }

              return a.maxOrder && a.maxOrder > b.maxOrder ? 1 : -1;
            });
            surveySelectionDiv.empty();

            if (this.survey) {
              var surveyFound = false;
              surveys.forEach(function (s) {
                var isCurSurvey = _this.survey.id.endsWith(s.id);

                surveySelectionDiv.append($("<option />").attr("selected", isCurSurvey).val(s.id).text(s.name));
                surveyFound |= isCurSurvey;
              }); // The survey has not been found among the ones cached

              if (!surveyFound) {
                // Cache it

                /*HpxImageSurvey.SURVEYS.push({
              id: this.survey.properties.id,
              name: this.survey.properties.name,
              maxOrder: this.survey.properties.maxOrder,
              url: this.survey.properties.url,
              options: this.survey.options
          });
          surveySelectionDiv.append($("<option />").attr("selected", true).val(this.survey.properties.id).text(this.survey.properties.name));*/
                console.warn(this.survey, " has not been found in SURVEYS!");
              } else {
                // Update the HpxImageSurvey
                var idxSelectedHiPS = surveySelectionDiv[0].selectedIndex;
                var surveyDef = HpxImageSurvey.SURVEYS[idxSelectedHiPS];
                surveyDef.options = this.survey.options;
              }
            }
          },
        },
        {
          key: "attachTo",
          value: function attachTo(parentDiv) {
            parentDiv.append(this.headerDiv).append(this.mainDiv);

            this._addListeners();
          },
        },
        {
          key: "show",
          value: function show() {
            this.mainDiv.style.display = "block";
          },
        },
        {
          key: "hide",
          value: function hide() {
            this.headerDiv.style.display = "none";
            this.mainDiv.style.display = "none";
          },
        },
      ]);

      return HiPSLayer;
    })(); // CONCATENATED MODULE: ./src/js/gui/Stack.js
    function Stack_classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function Stack_defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function Stack_createClass(Constructor, protoProps, staticProps) {
      if (protoProps) Stack_defineProperties(Constructor.prototype, protoProps);
      if (staticProps) Stack_defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }

    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File gui/Stack.js
     *
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    var Stack = /*#__PURE__*/ (function () {
      // Constructor
      function Stack(parentDiv, aladin, view) {
        Stack_classCallCheck(this, Stack);

        this.aladin = aladin;
        this.view = view;
        this.mainDiv = document.createElement("div");
        this.mainDiv.style.display = "none";
        this.mainDiv.classList.add("aladin-box", "aladin-layerBox", "aladin-cb-list");
        this.aladinDiv = parentDiv;
        parentDiv.appendChild(this.mainDiv);
        this.imgLayers = new Map();
        this.selectedLayer = undefined;

        this._createComponent();

        this._addListeners();
      }

      Stack_createClass(Stack, [
        {
          key: "_createComponent",
          value: function _createComponent() {
            var self = this; // first, update

            var layerBox = $(this.mainDiv);
            layerBox.empty();
            layerBox.append('<a class="aladin-closeBtn">&times;</a>' + '<div class="aladin-box-title">Stack</div>');
            layerBox.append(
              '<div class="aladin-box-separator"></div>' +
                '<div class="aladin-label">Image layers</div>' +
                '<button class="aladin-btn add-layer-hips" type="button">Add image layer</button>'
            );
            $(this.mainDiv)
              .find(".add-layer-hips")
              .click(function () {
                var layerName = Utils.uuidv4(); // A HIPS_LAYER_ADDED will be called after the hips is added to the view

                self.aladin.setOverlayImageLayer("CDS/P/DSS2/color", layerName);
              });

            if (this.imgLayers.size > 1) {
              layerBox.append('<div class="aladin-label">Overlay layers</div>');
              Array.from(this.imgLayers.values())
                .reverse()
                .forEach(function (imgLayer) {
                  if (imgLayer.survey.layer !== "base") {
                    imgLayer.attachTo(layerBox);
                  }
                });
            }

            layerBox.append('<div class="aladin-label">Base layer</div>');

            if (this.imgLayers.has("base")) {
              this.imgLayers.get("base").attachTo(layerBox);
            }

            layerBox.append('<div class="aladin-box-separator"></div>' + '<div class="aladin-label">Overlay layers</div>'); // loop over all overlay layers

            var layers = this.view.allOverlayLayers;
            var str = "<ul>";

            for (var k = layers.length - 1; k >= 0; k--) {
              var layer = layers[k];
              var name = layer.name;
              var checked = "";

              if (layer.isShowing) {
                checked = 'checked="checked"';
              }

              var tooltipText = "";
              var iconSvg = "";

              if (layer.type == "catalog" || layer.type == "progressivecat") {
                var nbSources = layer.getSources().length;
                tooltipText = nbSources + " source" + (nbSources > 1 ? "s" : "");
                iconSvg = AladinUtils.SVG_ICONS.CATALOG;
              } else if (layer.type == "moc") {
                tooltipText = "Coverage: " + (100 * layer.skyFraction()).toFixed(3) + " % of sky";
                iconSvg = AladinUtils.SVG_ICONS.MOC;
              } else if (layer.type == "overlay") {
                iconSvg = AladinUtils.SVG_ICONS.OVERLAY;
              }

              var rgbColor = $("<div></div>").css("color", layer.color).css("color"); // trick to retrieve the color as 'rgb(,,)' - does not work for named colors :(

              var labelColor = Color_Color.getLabelColorForBackground(rgbColor); // retrieve SVG icon, and apply the layer color

              var svgBase64 = window.btoa(iconSvg.replace(/FILLCOLOR/g, layer.color));
              str += '<li><div class="aladin-stack-icon" style=\'background-image: url("data:image/svg+xml;base64,' + svgBase64 + "\");'></div>";
              str +=
                '<input type="checkbox" ' +
                checked +
                ' id="aladin_lite_' +
                name +
                '"></input><label for="aladin_lite_' +
                name +
                '" class="aladin-layer-label" style="background: ' +
                layer.color +
                "; color:" +
                labelColor +
                ';" title="' +
                tooltipText +
                '">' +
                name +
                "</label>";
              str +=
                ' <button class="aladin-btn-small aladin-delete-graphic-layer" type="button" title="Delete this layer" data-uuid="' +
                layer.uuid +
                '" style="font-size: 10px!important; vertical-align: text-bottom!important; background-color: unset!important;">❌</button>';
              str += "</li>";
            }

            str += "</ul>";
            str += '<button class="aladin-btn my-1 catalogue-selector" type="button">Add catalogue</button>';
            layerBox.append(str);
            layerBox.find(".aladin-delete-graphic-layer").click(function () {
              var layerToDelete = self.aladin.findLayerByUUID($(this).data("uuid"));
              self.aladin.removeLayer(layerToDelete);
            });
            var searchCatalogBtn = layerBox.find(".catalogue-selector");
            searchCatalogBtn.click(function () {
              if (!self.catalogSelector) {
                var fnIdSelected = function fnIdSelected(type, params) {
                  if (type == "coneSearch") {
                    var catalogLayer = undefined;

                    if (params.baseURL.includes("/vizier.")) {
                      catalogLayer = A.catalogFromVizieR(params.id.replace("CDS/", ""), params.ra + " " + params.dec, params.radiusDeg, {
                        limit: params.limit,
                        onClick: "showTable",
                      });
                    } else {
                      var url = params.baseURL;

                      if (!url.endsWith("?")) {
                        url += "?";
                      }

                      url += "RA=" + params.ra + "&DEC=" + params.dec + "&SR=" + params.radiusDeg;
                      catalogLayer = A.catalogFromURL(url, {
                        limit: params.limit,
                        onClick: "showTable",
                      });
                    }

                    self.aladin.addCatalog(catalogLayer);
                  } else if (type == "hips") {
                    var hips = A.catalogHiPS(params.hipsURL, {
                    0 onClick: "showTable",
                      name: params.id,
                    });
                    self.aladin.addCatalog(hips);
                  } else if (type == "votable") {
                    var _catalogLayer = A.catalogFromURL(params.url, {
                      onClick: "showTable",
                    });

                    console.log(_catalogLayer);
                    self.aladin.addCatalog(_catalogLayer);
                  }
                };

                self.catalogSelector = new CatalogSelector(self.aladinDiv, self.aladin, fnIdSelected);
              }

              self.catalogSelector.show();
            });
            layerBox.append('<div class="aladin-blank-separator"></div>'); // gestion du réticule

            var checked = "";

            if (this.view.displayReticle) {
              checked = 'checked="checked"';
            }

            var reticleCb = $('<input type="checkbox" ' + checked + ' id="displayReticle" />');
            layerBox.append(reticleCb).append('<label for="displayReticle">Reticle</label><br/>');
            reticleCb.change(function () {
              self.aladin.showReticle($(this).is(":checked"));
            }); // Gestion grille Healpix

            checked = "";

            if (this.view.displayHpxGrid) {
              checked = 'checked="checked"';
            }

            var hpxGridCb = $('<input type="checkbox" ' + checked + ' id="displayHpxGrid"/>');
            layerBox.append(hpxGridCb).append('<label for="displayHpxGrid">HEALPix grid</label><br/>');
            hpxGridCb.change(function () {
              self.aladin.showHealpixGrid($(this).is(":checked"));
            }); // Coordinates grid plot

            checked = "";

            if (this.view.showCooGrid) {
              checked = 'checked="checked"';
            }

            var optionsOpenerForCoordinatesGrid = $('<span class="indicator right-triangle"> </span>');
            var coordinatesGridCb = $('<input type="checkbox" ' + checked + ' id="displayCoordinatesGrid"/>');
            var labelCoordinatesGridCb = $("<label>Coordinates grid</label>");
            var cooGridOptions = $(
              '<div class="layer-options" style="display: none;"><table><tbody><tr><td>Color</td><td><input type="color" value="#00ff00"></td></tr><tr><td>Opacity</td><td><input class="opacity" value="1.0" type="range" min="0" max="1" step="0.05"></td></tr><tr><td>Label size</td><td><input class="label-size" type="range" min="5" max="30" step="0.01"></td></tr></table></div>'
            );
            labelCoordinatesGridCb.prepend(coordinatesGridCb);
            layerBox.append(optionsOpenerForCoordinatesGrid).append(labelCoordinatesGridCb).append(cooGridOptions);
            coordinatesGridCb.change(function () {
              var isChecked = $(this).is(":checked");

              if (isChecked) {
                self.view.setGridConfig({
                  enabled: true,
                });
              } else {
                self.view.setGridConfig({
                  enabled: false,
                });
              }
            });
            optionsOpenerForCoordinatesGrid.click(function () {
              var $this = $(this);

              if ($this.hasClass("right-triangle")) {
                $this.removeClass("right-triangle");
                $this.addClass("down-triangle");
                cooGridOptions.slideDown(300);
              } else {
                $this.removeClass("down-triangle");
                $this.addClass("right-triangle");
                cooGridOptions.slideUp(300);
              }
            });
            var gridColorInput = cooGridOptions.find('input[type="color"]');
            var gridOpacityInput = cooGridOptions.find(".opacity");

            var updateGridcolor = function updateGridcolor() {
              var rgb = Color_Color.hexToRgb(gridColorInput.val());
              var opacity = gridOpacityInput.val();
              self.view.setGridConfig({
                color: [rgb.r / 255.0, rgb.g / 255.0, rgb.b / 255.0, parseFloat(gridOpacityInput.val())],
              });
            };

            gridColorInput.on("input", updateGridcolor);
            gridOpacityInput.on("input", updateGridcolor);
            var gridLabelSizeInput = cooGridOptions.find(".label-size");
            gridLabelSizeInput.on("input", function () {
              var size = +gridLabelSizeInput.val();
              self.view.setGridConfig({
                labelSize: size,
              });
            }); // coordinates grid - add event listeners

            ALEvent.COO_GRID_ENABLED.listenedBy(this.aladinDiv, function () {
              if (!coordinatesGridCb.prop("checked")) {
                coordinatesGridCb.prop("checked", true);
              }
            });
            ALEvent.COO_GRID_DISABLED.listenedBy(this.aladinDiv, function () {
              if (coordinatesGridCb.prop("checked")) {
                coordinatesGridCb.prop("checked", false);
              }
            });
            ALEvent.COO_GRID_UPDATED.listenedBy(this.aladinDiv, function (e) {
              var c = e.detail.color;
              var opacity = c[3].toFixed(2);

              if (gridOpacityInput.val() != opacity) {
                gridOpacityInput.val(opacity);
              }

              var hexColor = Color_Color.rgbToHex(Math.round(255 * c[0]), Math.round(255 * c[1]), Math.round(255 * c[2]));

              if (gridColorInput.val() != hexColor) {
                gridColorInput.val(hexColor);
              }
            });
            layerBox.append('<div class="aladin-box-separator"></div>' + '<div class="aladin-label">Tools</div>');
            var exportBtn = $('<button class="aladin-btn" type="button">Export view as PNG</button>');
            layerBox.append(exportBtn);
            exportBtn.click(function () {
              self.aladin.exportAsPNG();
            });
            layerBox.find(".aladin-closeBtn").click(function () {
              self.aladin.hideBoxes();
              return false;
            }); // handler to hide/show overlays

            $(this.mainDiv)
              .find("ul input")
              .change(function () {
                var layerName = $(this).attr("id").substr(12);
                var layer = self.aladin.layerByName(layerName);

                if ($(this).is(":checked")) {
                  layer.show();
                } else {
                  layer.hide();
                }
              });
          },
        },
        {
          key: "_addListeners",
          value: function _addListeners() {
            var self = this;
            this.aladin.aladinDiv.addEventListener("remove-layer", function (e) {
              var layerName = e.detail; // Just call remove as it will send a HIPS_LAYER_REMOVED after

              self.aladin.removeImageSurvey(layerName);

              if (self.selectedLayer === layerName) {
                self.selectedLayer = null;
              }
            });
            this.aladin.aladinDiv.addEventListener("select-layer", function (e) {
              var layerName = e.detail; // Update the color of the selected element

              if (self.selectedLayer) {
                var _headerClassName = "aladin-layer-header-" + self.selectedLayer;

                var _headerLayerElement = document.getElementsByClassName(_headerClassName)[0];
                _headerLayerElement.style.backgroundColor = "#eee";
                _headerLayerElement.nextSibling.style.backgroundColor = "#eee";
              }

              var headerClassName = "aladin-layer-header-" + layerName;
              var headerLayerElement = document.getElementsByClassName(headerClassName)[0];
              headerLayerElement.style.backgroundColor = "#aaa";
              headerLayerElement.nextSibling.style.backgroundColor = "#aaa";
              self.aladin.setActiveHiPSLayer(layerName);
              self.selectedLayer = layerName;
            }); // Events coming from the AL core

            ALEvent.HIPS_LAYER_ADDED.listenedBy(this.aladin.aladinDiv, function (e) {
              var survey = e.detail.survey;
              self.imgLayers.set(survey.layer, new HiPSLayer(self.aladin, self.view, survey));

              self._createComponent();
            });
            ALEvent.HIPS_LAYER_REMOVED.listenedBy(this.aladin.aladinDiv, function (e) {
              var layer = e.detail.layer;
              var hipsLayer = self.imgLayers.get(layer); // unbind the events

              hipsLayer.destroy();
              self.imgLayers["delete"](layer);

              self._createComponent();
            });
            ALEvent.GRAPHIC_OVERLAY_LAYER_ADDED.listenedBy(this.aladin.aladinDiv, function (e) {
              self._createComponent();
            });
            ALEvent.GRAPHIC_OVERLAY_LAYER_REMOVED.listenedBy(this.aladin.aladinDiv, function (e) {
              self._createComponent();
            });
          },
        },
        {
          key: "show",
          value: function show() {
            this.mainDiv.style.display = "block";
          },
        },
        {
          key: "hide",
          value: function hide() {
            this.mainDiv.style.display = "none";
          },
        },
      ]);

      return Stack;
    })();
    // EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js
    var injectStylesIntoStyleTag = __webpack_require__(3379);
    var injectStylesIntoStyleTag_default = /*#__PURE__*/ __webpack_require__.n(injectStylesIntoStyleTag);
    // EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleDomAPI.js
    var styleDomAPI = __webpack_require__(7795);
    var styleDomAPI_default = /*#__PURE__*/ __webpack_require__.n(styleDomAPI);
    // EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertBySelector.js
    var insertBySelector = __webpack_require__(569);
    var insertBySelector_default = /*#__PURE__*/ __webpack_require__.n(insertBySelector);
    // EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js
    var setAttributesWithoutAttributes = __webpack_require__(3565);
    var setAttributesWithoutAttributes_default = /*#__PURE__*/ __webpack_require__.n(setAttributesWithoutAttributes);
    // EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertStyleElement.js
    var insertStyleElement = __webpack_require__(9216);
    var insertStyleElement_default = /*#__PURE__*/ __webpack_require__.n(insertStyleElement);
    // EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleTagTransform.js
    var styleTagTransform = __webpack_require__(4589);
    var styleTagTransform_default = /*#__PURE__*/ __webpack_require__.n(styleTagTransform);
    // EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./src/css/aladin.css
    var aladin = __webpack_require__(9724); // CONCATENATED MODULE: ./src/css/aladin.css
    var options = {};

    options.styleTagTransform = styleTagTransform_default();
    options.setAttributes = setAttributesWithoutAttributes_default();

    options.insert = insertBySelector_default().bind(null, "head");

    options.domAPI = styleDomAPI_default();
    options.insertStyleElement = insertStyleElement_default();

    var update = injectStylesIntoStyleTag_default()(aladin /* default */.Z, options);

    /* harmony default export */ const css_aladin =
      aladin /* default */.Z && aladin /* default.locals */.Z.locals ? aladin /* default.locals */.Z.locals : undefined; // CONCATENATED MODULE: ./src/js/Aladin.js

    function Aladin_regeneratorRuntime() {
      "use strict";
      /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ Aladin_regeneratorRuntime =
        function _regeneratorRuntime() {
          return exports;
        };
      var exports = {},
        Op = Object.prototype,
        hasOwn = Op.hasOwnProperty,
        $Symbol = "function" == typeof Symbol ? Symbol : {},
        iteratorSymbol = $Symbol.iterator || "@@iterator",
        asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
        toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
      function define(obj, key, value) {
        return (
          Object.defineProperty(obj, key, {
            value: value,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          }),
          obj[key]
        );
      }
      try {
        define({}, "");
      } catch (err) {
        define = function define(obj, key, value) {
          return (obj[key] = value);
        };
      }
      function wrap(innerFn, outerFn, self, tryLocsList) {
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
          generator = Object.create(protoGenerator.prototype),
          context = new Context(tryLocsList || []);
        return (
          (generator._invoke = (function (innerFn, self, context) {
            var state = "suspendedStart";
            return function (method, arg) {
              if ("executing" === state) throw new Error("Generator is already running");
              if ("completed" === state) {
                if ("throw" === method) throw arg;
                return doneResult();
              }
              for (context.method = method, context.arg = arg; ; ) {
                var delegate = context.delegate;
                if (delegate) {
                  var delegateResult = maybeInvokeDelegate(delegate, context);
                  if (delegateResult) {
                    if (delegateResult === ContinueSentinel) continue;
                    return delegateResult;
                  }
                }
                if ("next" === context.method) context.sent = context._sent = context.arg;
                else if ("throw" === context.method) {
                  if ("suspendedStart" === state) throw ((state = "completed"), context.arg);
                  context.dispatchException(context.arg);
                } else "return" === context.method && context.abrupt("return", context.arg);
                state = "executing";
                var record = tryCatch(innerFn, self, context);
                if ("normal" === record.type) {
                  if (((state = context.done ? "completed" : "suspendedYield"), record.arg === ContinueSentinel)) continue;
                  return { value: record.arg, done: context.done };
                }
                "throw" === record.type && ((state = "completed"), (context.method = "throw"), (context.arg = record.arg));
              }
            };
          })(innerFn, self, context)),
          generator
        );
      }
      function tryCatch(fn, obj, arg) {
        try {
          return { type: "normal", arg: fn.call(obj, arg) };
        } catch (err) {
          return { type: "throw", arg: err };
        }
      }
      exports.wrap = wrap;
      var ContinueSentinel = {};
      function Generator() {}
      function GeneratorFunction() {}
      function GeneratorFunctionPrototype() {}
      var IteratorPrototype = {};
      define(IteratorPrototype, iteratorSymbol, function () {
        return this;
      });
      var getProto = Object.getPrototypeOf,
        NativeIteratorPrototype = getProto && getProto(getProto(values([])));
      NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol) &&
        (IteratorPrototype = NativeIteratorPrototype);
      var Gp = (GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype));
      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function (method) {
          define(prototype, method, function (arg) {
            return this._invoke(method, arg);
          });
        });
      }
      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);
          if ("throw" !== record.type) {
            var result = record.arg,
              value = result.value;
            return value && "object" == Aladin_typeof(value) && hasOwn.call(value, "__await")
              ? PromiseImpl.resolve(value.__await).then(
                  function (value) {
                    invoke("next", value, resolve, reject);
                  },
                  function (err) {
                    invoke("throw", err, resolve, reject);
                  }
                )
              : PromiseImpl.resolve(value).then(
                  function (unwrapped) {
                    (result.value = unwrapped), resolve(result);
                  },
                  function (error) {
                    return invoke("throw", error, resolve, reject);
                  }
                );
          }
          reject(record.arg);
        }
        var previousPromise;
        this._invoke = function (method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }
          return (previousPromise = previousPromise
            ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg)
            : callInvokeWithMethodAndArg());
        };
      }
      function mvybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];
        if (undefined === method) {
          if (((context.delegate = null), "throw" === context.method)) {
            if (
              delegate.iterator["return"] &&
              ((context.method = "return"), (context.arg = undefined), maybeInvokeDelegate(delegate, context), "throw" === context.method)
            )
              return ContinueSentinel;
            (context.method = "throw"), (context.arg = new TypeError("The iterator does not provide a 'throw' method"));
          }
          return ContinueSentinel;
        }
        var record = tryCatch(method, delegate.iterator, context.arg);
        if ("throw" === record.type) return (context.method = "throw"), (context.arg = record.arg), (context.delegate = null), ContinueSentinel;
        var info = record.arg;
        return info
          ? info.done
            ? ((context[delegate.resultName] = info.value),
              (context.next = delegate.nextLoc),
              "return" !== context.method && ((context.method = "next"), (context.arg = undefined)),
              (context.delegate = null),
              ContinueSentinel)
      3     : info
          : ((context.method = "throw"),
            (context.arg = new TypeError("iterator result is not an object")),
            (context.delegate = null),
            ContinueSentinel);
      }
      function pushTryEntry(locs) {
        var entry = { tryLoc: locs[0] };
        1 in locs && (entry.catchLoc = locs[1]), 2 in locs && ((entry.finallyLoc = locs[2]), (entry.afterLoc = locs[3])), this.tryEntries.push(entry);
      }
      function resetTryEntry(entry) {
        var record = entry.completion || {};
        (record.type = "normal"), delete record.arg, (entry.completion = record);
      }
      function Context(tryLocsList) {
        (this.tryEntries = [{ tryLoc: "root" }]), tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
      }
      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];
          if (iteratorMethod) return iteratorMethod.call(iterable);
          if ("function" == typeof iterable.next) return iterable;
          if (!isNaN(iterable.length)) {
            var i = -1,
              next = function next() {
                for (; ++i < iterable.length; ) {
                  if (hasOwn.call(iterable, i)) return (next.value = iterable[i]), (next.done = !1), next;
                }
                return (next.value = undefined), (next.done = !0), next;
              };
            return (next.next = next);
          }
        }
        return { next: doneResult };
      }
      function doneResult() {
        return { value: undefined, done: !0 };
      }
      return (
        (GeneratorFunction.prototype = GeneratorFunctionPrototype),
        define(Gp, "constructor", GeneratorFunctionPrototype),
        define(GeneratorFunctionPrototype, "constructor", GeneratorFunction),
        (GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction")),
        (exports.isGeneratorFunction = function (genFun) {
          var ctor = "function" == typeof genFun && genFun.constructor;
          return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
        }),
        (exports.mark = function (genFun) {
          return (
            Object.setPrototypeOf
              ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype)
              : ((genFun.__proto__ = GeneratorFunctionPrototype), define(genFun, toStringTagSymbol, "GeneratorFunction")),
            (genFun.prototype = Object.create(Gp)),
            genFun
          );
        }),
        (exports.awrap = function (arg) {
          return { __await: arg };
        }),
        defineIteratorMethods(AsyncIterator.prototype),
        define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
          return this;
        }),
        (exports.AsyncIterator = AsyncIterator),
        (exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
          void 0 === PromiseImpl && (PromiseImpl = Promise);
          var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
          return exports.isGeneratorFunction(outerFn)
            ? iter
            : iter.next().then(function (result) {
                return result.done ? result.value : iter.next();
              });
        }),
        defineIteratorMethods(Gp),
        define(Gp, toStringTagSymbol, "Generator"),
        define(Gp, iteratorSymbol, function () {
          return this;
        }),
        define(Gp, "toString", function () {
          return "[object Generator]";
        }),
        (exports.keys = function (object) {
          var keys = [];
          for (var key in object) {
            keys.push(key);
          }
          return (
            keys.reverse(),
            function next() {
              for (; keys.length; ) {
                var key = keys.pop();
                if (key in object) return (next.value = key), (next.done = !1), next;
              }
              return (next.done = !0), next;
            }
          );
        }),
        (exports.values = values),
        (Context.prototype = {
          constructor: Context,
          reset: function reset(skipTempReset) {
            if (
              ((this.prev = 0),
              (this.next = 0),
              (this.sent = this._sent = undefined),
              (this.done = !1),
              (this.delegate = null),
              (this.method = "next"),
              (this.arg = undefined),
              this.tryEntries.forEach(resetTryEntry),
              !skipTempReset)
            )
              for (var name in this) {
                "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
              }
          },
          stop: function stop() {
            this.done = !0;
            var rootRecord = this.tryEntries[0].completion;
            if ("throw" === rootRecord.type) throw rootRecord.arg;
            return this.rval;
          },
          dispatchException: function dispatchException(exception) {
            if (this.done) throw exception;
            var context = this;
            function handle(loc, caught) {
              return (
                (record.type = "throw"),
                (record.arg = exception),
                (context.next = loc),
                caught && ((context.method = "next"), (context.arg = undefined)),
                !!caught
              );
            }
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i],
                record = entry.completion;
              if ("root" === entry.tryLoc) return handle("end");
              if (entry.tryLoc <= this.prev) {
                var hasCatch = hasOwn.call(entry, "catchLoc"),
                  hasFinally = hasOwn.call(entry, "finallyLoc");
                if (hasCatch && hasFinally) {
                  if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
                  if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
                } else if (hasCatch) {
                  if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
                } else {
                  if (!hasFinally) throw new Error("try statement without catch or finally");
                  if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
                }
              }
            }
          },
          abrupt: function abrupt(type, arg) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                var finallyEntry = entry;
                break;
              }
            }
            finallyEntry &&
              ("break" === type || "continue" === type) &&
              finallyEntry.tryLoc <= arg &&
              arg <= finallyEntry.finallyLoc &&
              (finallyEntry = null);
            var record = finallyEntry ? finallyEntry.completion : {};
            return (
              (record.type = type),
              (record.arg = arg),
              finallyEntry ? ((this.method = "next"), (this.next = finallyEntry.finallyLoc), ContinueSentinel) : this.complete(record)
            );
          },
          complete: function complete(record, afterLoc) {
            if ("throw" === record.type) throw record.arg;
            return (
              "break" === record.type || "continue" === record.type
                ? (this.next = record.arg)
                : "return" === record.type
                ? ((this.rval = this.arg = record.arg), (this.method = "return"), (this.next = "end"))
                : "normal" === record.type && afterLoc && (this.next = afterLoc),
              ContinueSentinel
            );
          },
          finish: function finish(finallyLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
            }
          },
          catch: function _catch(tryLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc === tryLoc) {
                var record = entry.completion;
                if ("throw" === record.type) {
                  var thrown = record.arg;
                  resetTryEntry(entry);
                }
                return thrown;
              }
            }
            throw new Error("illegal catch attempt");
          },
          delegateYield: function delegateYield(iterable, resultName, nextLoc) {
            return (
              (this.delegate = {
                iterator: values(iterable),
                resultName: resultName,
                nextLoc: nextLoc,
              }),
              "next" === this.method && (this.arg = undefined),
              ContinueSentinel
            );
          },
        }),
        exports
      );
    }

    function Aladin_asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }
      if (info.done) {
        resolve(value);
      } else {
        Promise.resolve(value).then(_next, _throw);
      }
    }

    function Aladin_asyncToGenerator(fn) {
      return function () {
        var self = this,
          args = arguments;
        return new Promise(function (resolve, reject) {
          var gen = fn.apply(self, args);
          function _next(value) {
            Aladin_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }
          function _throw(err) {
            Aladin_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }
          _next(undefined);
        });
      };
    }

    function Aladin_slicedToArray(arr, i) {
      return (
        Aladin_arrayWithHoles(arr) || Aladin_iterableToArrayLimit(arr, i) || Aladin_unsupportedIterableToArray(arr, i) || Aladin_nonIterableRest()
      );
    }

    function Aladin_nonIterableRest() {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
      );
    }

    function Aladin_unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return Aladin_arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Aladin_arrayLikeToArray(o, minLen);
    }

    function Aladin_arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }

    function Aladin_iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator]) || arr["@@iterator"];
      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;
      var _s, _e;
      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }
     7return _arr;
    }

    function Aladin_arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function Aladin_typeof(obj) {
      "@babel/helpers - typeof";
      return (
        (Aladin_typeof =
          "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
            ? function (obj) {
                return typeof obj;
              }
            : function (obj) {
                return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
              }),
        Aladin_typeof(obj)
      );
    }

    // Copyright 2013 - UDS/CNRS
    // The Aladin Lite program is distributed under the terms
    // of the GNU General Public License version 3.
    //
    // This file is part of Aladin Lite.
    //
    //    Aladin Lite is free software: you can redistribute it and/or modify
    //    it under the terms of the GNU General Public License as published by
    //    the Free Software Foundation, version 3 of the License.
    //
    //    Aladin Lite is distributed in the hope that it will be useful,
    //    but WITHOUT ANY WARRANTY; without even the implied warranty of
    //    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    //    GNU General Public License for more details.
    //
    //    The GNU General Public License is available in COPYING file
    //    along with Aladin Lite.
    //

    /******************************************************************************
     * Aladin Lite project
     *
     * File Aladin.js (main class)
     * Facade to expose Aladin Lite methods
     *
     * Author: Thomas Boch[CDS]
     *
     *****************************************************************************/

    // Import aladin css inside the project

    var Aladin = (function () {
      // Constructor
      var Aladin = function Aladin(aladinDiv, requestedOptions) {
        var _this = this;

        // check that aladinDiv exists, stop immediately otherwise
        if ($(aladinDiv).length == 0) {
          return;
        }

        this.webglAPI = null;
        var self = this; // if not options was set, try to retrieve them from the query string

        if (requestedOptions === undefined) {
          requestedOptions = this.getOptionsFromQueryString();
        }

        requestedOptions = requestedOptions || {}; // 'fov' option was previsouly called 'zoom'

        if ("zoom" in requestedOptions) {
          var fovValue = requestedOptions.zoom;
          delete requestedOptions.zoom;
          requestedOptions.fov = fovValue;
        } // merge with default options

        var options = {};

        for (var key in Aladin.DEFAULT_OPTIONS) {
          if (requestedOptions[key] !== undefined) {
            options[key] = requestedOptions[key];
          } else {
            options[key] = Aladin.DEFAULT_OPTIONS[key];
          }
        }

        for (var key in requestedOptions) {
          if (Aladin.DEFAULT_OPTIONS[key] === undefined) {
            options[key] = requestedOptions[key];
          }
        }

        this.options = options;
        $("<style type='text/css'> .aladin-reticleColor { color: " + this.options.reticleColor + "; font-weight:bold;} </style>").appendTo(aladinDiv);
        this.aladinDiv = aladinDiv;
        this.reduceDeformations = true; // parent div

        $(aladinDiv).addClass("aladin-container");
        var cooFrame = CooFrameEnum.fromString(options.cooFrame, CooFrameEnum.J2000); // locationDiv is the div where we write the position

        var locationDiv = $(
          '<div class="aladin-location">' +
            (options.showFrame
              ? '<select class="aladin-frameChoice"><option value="' +
                CooFrameEnum.J2000.label +
                '" ' +
                (cooFrame == CooFrameEnum.J2000 ? 'selected="selected"' : "") +
                '>J2000</option><option value="' +
                CooFrameEnum.J2000d.label +
                '" ' +
                (cooFrame == CooFrameEnum.J2000d ? 'selected="selected"' : "") +
                '>J2000d</option><option value="' +
                CooFrameEnum.GAL.label +
                '" ' +
                (cooFrame == CooFrameEnum.GAL ? 'selected="selected"' : "") +
                ">GAL</option></select>"
              : "") +
            '<span class="aladin-location-text"></span></div>'
        ).appendTo(aladinDiv); // div where FoV value is written

        var fovDiv = $('<div class="aladin-fov"></div>').appendTo(aladinDiv); // zoom control

        if (options.showZoomControl) {
          $(
            '<div class="aladin-zoomControl"><a href="#" class="zoomPlus" title="Zoom in">+</a><a href="#" class="zoomMinus" title="Zoom out">&ndash;</a></div>'
          ).appendTo(aladinDiv);
        } // maximize control

        if (options.showFullscreenControl) {
          $('<div class="aladin-fullscreenControl aladin-maximize" title="Full screen"></div>').appendTo(aladinDiv);
        }

        this.fullScreenBtn = $(aladinDiv).find(".aladin-fullscreenControl");
        this.fullScreenBtn.click(function () {
          self.toggleFullscreen(self.options.realFullscreen);
        }); // react to fullscreenchange event to restore initial width/height (if user pressed ESC to go back from full screen)

        $(document).on("fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange", function (e) {
          var fullscreenElt =
            document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

          if (fullscreenElt === null || fullscreenElt === undefined) {
            self.fullScreenBtn.removeClass("aladin-restore");
            self.fullScreenBtn.addClass("aladin-maximize");
            self.fullScreenBtn.attr("title", "Full screen");
            $(self.aladinDiv).removeClass("aladin-fullscreen");
            var fullScreenToggledFn = self.callbacksByEventName["fullScreenToggled"];
            var isInFullscreen = self.fullScreenBtn.hasClass("aladin-restore");
            typeof fullScreenToggledFn === "function" && fullScreenToggledFn(isInFullscreen);
          }
        }); // Aladin logo

        new AladinLogo(aladinDiv); // Projection selector

        new ProjectionSelector(aladinDiv, this); // we store the boxes

        this.boxes = []; // measurement table

        this.measurementTable = new MeasurementTable(aladinDiv);
        var location = new Location(locationDiv.find(".aladin-location-text")); // set different options

        this.view = new View(this, location, fovDiv, cooFrame, options.fov);
        this.cacheSurveys = new Map(); // Stack GUI

        this.stack = new Stack(this.aladinDiv, this, this.view);
        this.boxes.push(this.stack);

        if (options && options.showCooGrid) {
          this.view.setGridConfig({
            enabled: true,
            color: [0.38, 0.77, 0.59, 1.0],
          });
          this.view.showCooGrid = true;
        } // Set the projection

        var projection = (options && options.projection) || "SIN";
        this.view.setProjection(projection); // layers control panel
        // TODO : valeur des checkbox en fonction des options

        if (options.showLayersControl) {
          // button to show Stack interface
          var d = $('<div class="aladin-layersControl-container" title="Manage layers"><div class="aladin-layersControl"></div></div>');
          d.appendTo(aladinDiv); // we return false so that the default event is not submitted, and to prevent event bubbling

          d.click(function () {
            self.hideBoxes();
            self.showLayerBox();
            return false;
          });
        } // goto control panel

        if (options.showGotoControl) {
          var d = $('<div class="aladin-gotoControl-container" title="Go to position"><div class="aladin-gotoControl"></div></div>');
          d.appendTo(aladinDiv);
          var gotoBox = $(
            '<div class="aladin-box aladin-gotoBox">' +
              '<a class="aladin-closeBtn">&times;</a>' +
              '<div style="clear: both;"></div>' +
              '<form class="aladin-target-form">Go to: <input type="text" placeholder="Object name/position" /></form></div>'
          );
          gotoBox.appendTo(aladinDiv);
          this.boxes.push(gotoBox);
          var input = gotoBox.find(".aladin-target-form input");
          input.on("paste keydown", function () {
            $(this).removeClass("aladin-unknownObject"); // remove red border
          }); // TODO : classe GotoBox

          d.click(function () {
            self.hideBoxes();
            input.val("");
            input.removeClass("aladin-unknownObject");
            gotoBox.show();
            input.focus();
            return false;
          });
          gotoBox.find(".aladin-closeBtn").click(function () {
            self.hideBoxes();
            return false;
          });
        } // simbad pointer tool

        if (options.showSimbadPointerControl) {
          var d = $(
            '<div class="aladin-simbadPointerControl-container" title="SIMBAD pointer"><div class="aladin-simbadPointerControl"></div></div>'
          );
          d.appendTo(aladinDiv);
          d.click(function () {
            self.view.setMode(View.TOOL_SIMBAD_POINTER);
          });
        } // share control panel

        if (options.showShareControl) {
          var d = $('<div class="aladin-shareControl-container" title="Get link for current view"><div class="aladin-qhareControl"></div></div>');
          d.appendTo(aladinDiv);
          var shareBox = $(
            '<div class="aladin-box aladin-shareBox">' +
              '<a class="aladin-closeBtn">&times;</a>' +
              '<div style="clear: both;"></div>' +
              'Link to previewer: <span class="info"></span>' +
              '<input type="text" class="aladin-shareInput" />' +
              "</div>"
          );
          shareBox.appendTo(aladinDiv);
          this.boxes.push(shareBox); // TODO : classe GotoBox, GenericBox

          d.click(function () {
            self.hideBoxes();
            shareBox.show();
            var url = self.getShareURL();
            shareBox.find(".aladin-shareInput").val(url).select();
            document.execCommand("copy");
            return false;
          });
          shareBox.find(".aladin-closeBtn").click(function () {
            self.hideBoxes();
            return false;
          });
        }

        this.gotoObject(options.target, undefined, {
          forceAnimation: false,
        });

        if (options.log) {
          var params = requestedOptions;
          params["version"] = Aladin.VERSION;
          Logger.log("startup", params);
        }

        this.showReticle(options.showReticle);

        if (options.catalogUrls) {
          for (var k = 0, len = options.catalogUrls.length; k < len; k++) {
            this.createCatalogFromVOTable(options.catalogUrls[k]);
          }
        } // Add the image layers
        // For that we check the survey key of options
        // It can be given as a single string or an array of strings
        // for multiple blending surveys

        if (options.survey) {
          if (Array.isArray(options.survey)) {
            var i = 0;
            options.survey.forEach(function (rootURLOrId) {
              if (i == 0) {
                _this.setBaseImageLayer(rootURLOrId);
              } else {
                _this.setOverlayImageLayer(rootURLOrId, Utils.uuidv4());
              }

              i++;
            });
          } else {
            this.setBaseImageLayer(options.survey);
          }
        } else {
          this.setBaseImageLayer(DEFAULT_OPTIONS.survey);
        }

        this.view.showCatalog(opeions.showCatalog);
        var aladin = this;
        $(aladinDiv)
          .find(".aladin-frameChoice")
          .change(function () {
            aladin.setFrame($(this).val());
          });
        $(aladinDiv)
          .find(".aladin-target-form")
          .submit(function () {
            aladin.gotoObject($(this).find("input").val(), function () {
              $(aladinDiv).find(".aladin-target-form input").addClass("aladin-unknownObject");
            });
            return false;
          });
        var zoomPlus = $(aladinDiv).find(".zoomPlus");
        zoomPlus.click(function () {
          aladin.increaseZoom();
          return false;
        });
        zoomPlus.bind("mousedown", function (e) {
          e.preventDefault(); // to prevent text selection
        });
        var zoomMinus = $(aladinDiv).find(".zoomMinus");
        zoomMinus.click(function () {
          aladin.decreaseZoom();
          return false;
        });
        zoomMinus.bind("mousedown", function (e) {
          e.preventDefault(); // to prevent text selection
        });
        this.callbacksByEventName = {}; // we store the callback functions (on 'zoomChanged', 'positionChanged', ...) here
        // initialize the Vue components
        //if (typeof Vue != "undefined") {
        //this.discoverytree = new DiscoveryTree(this);
        //}

        this.view.redraw(); // go to full screen ?

        if (options.fullScreen) {
          // strange behaviour to wait for a sec
          window.setTimeout(function () {
            self.toggleFullscreen(self.options.realFullscreen);
          }, 10);
        }
      };
      /**** CONSTANTS ****/

      Aladin.VERSION = "3.0-beta0";
      Aladin.JSONP_PROXY = "https://alasky.unistra.fr/cgi/JSONProxy"; //Aladin.JSONP_PROXY = "https://alaskybis.unistra.fr/cgi/JSONProxy";
      // access to WASM libraries

      Aladin.wasmLibs = {};
      Aladin.webglAPI = [];
      Aladin.DEFAULT_OPTIONS = {
        survey: "CDS/P/2MASS/color",
        target: "0 +0",
        cooFrame: "J2000",
        fov: 60,
        showReticle: false,
        showZoomControl: true,
        showFullscreenControl: true,
        showLayersControl: true,
        showGotoControl: true,
        showSimbadPointerControl: false,
        showShareControl: false,
        showCatalog: true,
        // TODO: still used ??
        showFrame: true,
        showCooGrid: true,
        fullScreen: false,
        reticleColor: "rgb(178, 50, 178)",
        reticleSize: 22,
        log: true,
        allowFullZoomout: false,
        realFullscreen: false,
        showAllskyRing: false,
        allskyRingColor: "#c8c8ff",
        allskyRingWidth: 8,
        pixelateCanvas: true,
      }; // realFullscreen: AL div expands not only to the size of its parent, but takes the whole available screen estate

      Aladin.prototype.toggleFullscreen = function (realFullscreen) {
        realFullscreen = Boolean(realFullscreen);
        this.fullScreenBtn.toggleClass("aladin-maximize aladin-restore");
        var isInFullscreen = this.fullScreenBtn.hasClass("aladin-restore");
        this.fullScreenBtn.attr("title", isInFullscreen ? "Restore original size" : "Full screen");
        $(this.aladinDiv).toggleClass("aladin-fullscreen");

        if (realFullscreen) {
          // go to "real" full screen mode
          if (isInFullscreen) {
            var d = this.aladinDiv;

            if (d.requestFullscreen) {
              d.requestFullscreen();
            } else if (d.webkitRequestFullscreen) {
              d.webkitRequestFullscreen();
            } else if (d.mozRequestFullScreen) {
              // notice the difference in capitalization for Mozilla functions ...
              d.mozRequestFullScreen();
            } else if (d.msRequestFullscreen) {
              d.msRequestFullscreen();
            }
          } // exit from "real" full screen mode
          else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            }
          }
        }

        this.view.fixLayoutDimensions(); // force call to zoomChanged callback

        var fovChangedFn = this.callbacksByEventName["zoomChanged"];
        typeof fovChangedFn === "function" && fovChangedFn(this.view.fov);
        var fullScreenToggledFn = this.callbacksByEventName["fullScreenToggled"];
        typeof fullScreenToggledFn === "function" && fullScreenToggledFn(isInFullscreen);
      };

      Aladin.prototype.setAngleRotation = function (theta) {
        this.view.setAngleRotation(theta);
      };

      Aladin.prototype.getOptionsFromQueryString = function () {
        var options = {};
        var requestedTarget = $.urlParam("target");

        if (requestedTarget) {
          options.target = requestedTarget;
        }

        var requestedFrame = $.urlParam("frame");

        if (requestedFrame && CooFrameEnum[requestedFrame]) {
          options.frame = requestedFrame;
        }

        var requestedSurveyId = $.urlParam("survey");

        if (requestedSurveyId && HpxImageSurvey.getSurveyInfoFromId(requestedSurveyId)) {
          options.survey = requestedSurveyId;
        }

        var requestedZoom = $.urlParam("zoom");

        if (requestedZoom && requestedZoom > 0 && requestedZoom < 180) {
          options.zoom = requestedZoom;
        }

        var requestedShowreticle = $.urlParam("showReticle");

        if (requestedShowreticle) {
          options.showReticle = requestedShowreticle.toLowerCase() == "true";
        }

        var requestedCooFrame = $.urlParam("cooFrame");

        if (requestedCooFrame) {
          options.cooFrame = requestedCooFrame;
        }

        var requestedFullscreen = $.urlParam("fullScreen");

        if (requestedFullscreen !== undefined) {
          options.fullScreen = requestedFullscreen;
        }

        return options;
      }; // @API

      Aladin.prototype.setFoV = Aladin.prototype.setFov = function (fovDegrees) {
        this.view.setZoom(fovDegrees);
      }; // @API
      // (experimental) try to adjust the FoV to the given object name. Does nothing if object is not known from Simbad

      Aladin.prototype.adjustFovForObject = function (objectName) {
        var self = this;
        this.getFovForObject(objectName, function (fovDegrees) {
          self.setFoV(fovDegrees);
        });
      };

      Aladin.prototype.getFovForObject = function (objectName, callback) {
        var query =
          "SELECT galdim_majaxis, V FROM basic JOIN ident ON oid=ident.oidref JOIN allfluxes ON oid=allfluxes.oidref WHERE id='" + objectName + "'";
        var url = "//simbad.u-strasbg.fr/simbad/sim-tap/sync?query=" + encodeURIComponent(query) + "&request=doQuery&lang=adql&format=json&phase=run";
        var ajax = Utils.getAjaxObject(url, "GET", "json", false);
        ajax.done(function (result) {
          var defaultFov = 4 / 60; // 4 arcmin

          var fov = defaultFov;

          if ("data" in result && result.data.length > 0) {
            var galdimMajAxis = Utils.isNumber(result.data[0][0]) ? result.data[0][0] / 60.0 : null; // result gives galdim in arcmin

            var magV = Utils.isNumber(result.data[0][1]) ? result.data[0][1] : null;

            if (galdimMajAxis !== null) {
              fov = 2 * galdimMajAxis;
            } else if (magV !== null) {
              if (magV < 10) {
                fov = (2 * Math.pow(2.0, 6 - magV / 2.0)) / 60;
              }
            }
          }

          typeof callback === "function" && callback(fov);
        });
      };

      Aladin.prototype.setFrame = function (frameName) {
        if (!frameName) {
          return;
        }

        var newFrame = CooFrameEnum.fromString(frameName, CooFrameEnum.J2000);

        if (newFrame == this.view.cooFrame) {
          return;
        }

        this.view.changeFrame(newFrame); // màj select box

        $(this.aladinDiv).find(".aladin-frameChoice").val(newFrame.label);
      };

      Aladin.prototype.setProjection = function (projection) {
        if (!projection) {
          return;
        }

        this.view.setProjection(projection);
        ALEvent.PROJECTION_CHANGED.dispatchedTo(this.aladinDiv, {
          projection: projection,
        });
      };
      /** point view to a given object (resolved by Sesame) or position
       * @api
       *
       * @param: target; object name or position
       * @callbackOptions: (optional) the object with key 'success' and/or 'error' containing the success and error callback functions.
       *
       */

      Aladin.prototype.gotoObject = function (targetName, callbackOptions, options) {
        var successCallback = undefined;
        var errorCallback = undefined;

        if (Aladin_typeof(callbackOptions) === "object") {
          if (callbackOptions.hasOwnProperty("success")) {
            successCallback = callbackOptions.success;
          }

          if (callbackOptions.hasOwnProperty("error")) {
            errorCallback = callbackOptions.error;
          }
        } // this is for compatibility reason with the previous method signature which was function(targetName, errorCallback)
        else if (typeof callbackOptions === "function") {
          errorCallback = callbackOptions;
        }

        var isObjectName = /[a-zA-Z]/.test(targetName); // try to parse as a position

        if (!isObjectName) {
          var coo = new coo_Coo();
          coo.parse(targetName); // Convert from view coo sys to icrsj2000

          var _this$view$aladin$web = this.view.aladin.webglAPI.viewToICRSJ2000CooSys(coo.lon, coo.lat),
            _this$view$aladin$web2 = Aladin_slicedToArray(_this$view$aladin$web, 2),
            ra = _this$view$aladin$web2[0],
            dec = _this$view$aladin$web2[1];

          this.view.pointTo(ra, dec, options);
          typeof successCallback === "function" && successCallback(this.getRaDec());
        } // ask resolution by Sesame
        else {
          var self = this;
          Sesame.resolve(
            targetName,
            function (data) {
              // success callback
              // Location given in icrs at J2000
              var coo = data.Target.Resolver;
              self.view.pointTo(coo.jradeg, coo.jdedeg, options);
              typeof successCallback === "function" && successCallback(self.getRaDec());
            },
            function (data) {
              // errror callback
              if (console) {
                console.log("Could not resolve object name " + targetName);
                console.log(data);
              }

              typeof errorCallback === "function" && errorCallback();
            }
          );
        }
      };
      /**
       * go to a given position, expressed in the current coordinate frame
       *
       * @API
       */

      Aladin.prototype.gotoPosition = function (lon, lat) {
        var radec; // first, convert to J2000 if needed

        if (this.view.cooFrame == CooFrameEnum.GAL) {
          radec = CooConversion.GalacticToJ2000([lon, lat]);
        } else {
          radec = [lon, lat];
        }

        this.view.pointTo(radec[0], radec[1]);
      };

      var doAnimation = function doAnimation(aladin) {
        var params = aladin.animationParams;

        if (params == null || !params["running"]) {
          return;
        }

        var now = new Date().getTime(); // this is the animation end: set the view to the end position, and call complete callback

        if (now > params["end"]) {
          aladin.gotoRaDec(params["raEnd"], params["decEnd"]);

          if (params["complete"]) {
            params["complete"]();
          }

          return;
        } // compute current position

        var fraction = (now - params["start"]) / (params["end"] - params["start"]);
        var curPos = intermediatePoint(yarams["raStart"], params["decStart"], params["raEnd"], params["decEnd"], fraction);
        var curRa = curPos[0];
        var curDec = curPos[1]; //var curRa =  params['raStart'] + (params['raEnd'] - params['raStart']) * (now-params['start']) / (params['end'] - params['start']);
        //var curDec = params['decStart'] + (params['decEnd'] - params['decStart']) * (now-params['start']) / (params['end'] - params['start']);

        aladin.gotoRaDec(curRa, curDec);
        setTimeout(function () {
          doAnimation(aladin);
        }, 50);
      };
      /*
       * Stop all animations that have been initiated  by animateToRaDec or by zoomToFoV
       * @API
       *
       */

      Aladin.prototype.stopAnimation = function () {
        if (this.zoomAnimationParams) {
          this.zoomAnimationParams["running"] = false;
        }

        if (this.animationParams) {
          this.animationParams["running"] = false;
        }
      };
      /*
       * animate smoothly from the current position to the given ra, dec
       *
       * the total duration (in seconds) of the animation can be given (otherwise set to 5 seconds by default)
       *
       * complete: a function to call once the animation has completed
       *
       * @API
       *
       */

      Aladin.prototype.animateToRaDec = function (ra, dec, duration, complete) {
        duration = duration || 5;
        this.animationParams = null;
        var animationParams = {};
        animationParams["start"] = new Date().getTime();
        animationParams["end"] = new Date().getTime() + 1000 * duration;
        var raDec = this.getRaDec();
        animationParams["raStart"] = raDec[0];
        animationParams["decStart"] = raDec[1];
        animationParams["raEnd"] = ra;
        animationParams["decEnd"] = dec;
        animationParams["complete"] = complete;
        animationParams["running"] = true;
        this.animationParams = animationParams;
        doAnimation(this);
      };

      var doZoomAnimation = function doZoomAnimation(aladin) {
        var params = aladin.zoomAnimationParams;

        if (params == null || !params["running"]) {
          return;
        }

        var now = new Date().getTime(); // this is the zoom animation end: set the view to the end fov, and call complete callback

        if (now > params["end"]) {
          aladin.setFoV(params["fovEnd"]);

          if (params["complete"]) {
            params["complete"]();
          }

          return;
        } // compute current position

        var fraction = (now - params["start"]) / (params["end"] - params["start"]);
        var curFov = params["fovStart"] + (params["fovEnd"] - params["fovStart"]) * Math.sqrt(fraction);
        aladin.setFoV(curFov);
        setTimeout(function () {
          doZoomAnimation(aladin);
        }, 50);
      };
      /*
       * zoom smoothly from the current FoV to the given new fov to the given ra, dec
       *
       * the total duration (in seconds) of the animation can be given (otherwise set to 5 seconds by default)
       *
       * complete: a function to call once the animation has completed
       *
       * @API
       *
       */

      Aladin.prototype.zoomToFoV = function (fov, duration, complete) {
        duration = duration || 5;
        this.zoomAnimationParams = null;
        var zoomAnimationParams = {};
        zoomAnimationParams["start"] = new Date().getTime();
        zoomAnimationParams["end"] = new Date().getTime() + 1000 * duration;
        var fovArray = this.getFov();
        zoomAnimationParams["fovStart"] = Math.max(fovArray[0], fovArray[1]);
        zoomAnimationParams["fovEnd"] = fov;
        zoomAnimationParams["complete"] = complete;
        zoomAnimationParams["running"] = true;
        this.zoomAnimationParams = zoomAnimationParams;
        doZoomAnimation(this);
      };
      /**
       *  Compute intermediate point between points (lng1, lat1) and (lng2, lat2)
       *  at distance fraction times the total distance (fraction between 0 and 1)
       *
       *  Return intermediate points in degrees
       *
       */

      function intermediatePoint(lng1, lat1, lng2, lat2, fraction) {
        function degToRad(d) {
          return (d * Math.PI) / 180;
        }

        function radToDeg(r) {
          return (r * 180) / Math.PI;
        }

        var lat1 = degToRad(lat1);
        var lng1 = degToRad(lng1);
        var lat2 = degToRad(lat2);
        var lng2 = degToRad(lng2);
        var d =
          2 *
          Math.asin(Math.sqrt(Math.pow(Math.sin((lat1 - lat2) / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng1 - lng2) / 2), 2)));
        var A = Math.sin((1 - fraction) * d) / Math.sin(d);
        var B = Math.sin(fraction * d) / Math.sin(d);
        var x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
        var y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
        var z = A * Math.sin(lat1) + B * Math.sin(lat2);
        var lon = Math.atan2(y, x);
        var lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
        return [radToDeg(lon), radToDeg(lat)];
      }

      /**
       * get current [ra, dec] position of the center of the view
       *
       * @API
       */

      Aladin.prototype.getRaDec = function () {
        /*if (this.view.cooFrame.system == CooFrameEnum.SYSTEMS.J2000) {
        return [this.view.viewCenter.lon, this.view.viewCenter.lat];
    }
    else {
        var radec = CooConversion.GalacticToJ2000([this.view.viewCenter.lon, this.view.viewCenter.lat]);
        return radec;
     }*/
        var radec = this.webglAPI.getCenter(); // This is given in the frame of the view
        // We must convert it to ICRSJ2000

        var radec_j2000 = this.view.aladin.webglAPI.viewToICRSJ2000CooSys(radec[0], radec[1]);

        if (radec_j2000[0] < 0) {
          return [radec_j2000[0] + 360.0, radec_j2000[1]];
        }

        return radec_j2000;
      };
      /**
       * point to a given position, expressed as a ra,dec coordinate
       *
       * @API
       */

      Aladin.prototype.gotoRaDec = function (ra, dec) {
        this.view.pointTo(ra, dec);
      };

      Aladin.prototype.showHealpixGrid = function (show) {
        this.view.showHealpixGrid(show);
      };

      Aladin.prototype.showSurvey = function (show) {
        this.view.showSurvey(show);
      };

      Aladin.prototype.showCatalog = function (show) {
        this.view.showCatalog(show);
      };

      Aladin.prototype.showReticle = function (show) {
        this.view.showReticle(show);
        $("#displayReticle").attr("checked", show);
      };

      Aladin.prototype.removeLayers = function () {
        this.view.removeLayers();
      }; // these 3 methods should4be merged into a unique "add" method

      Aladin.prototype.addCatalog = function (catalog) {
        this.view.addCatalog(catalog);
        ALEvent.GRAPHIC_OVERLAY_LAYER_ADDED.dispatchedTo(this.aladinDiv, {
          layer: catalog,
        });
      };

      Aladin.prototype.addOverlay = function (overlay) {
        this.view.addOverlay(overlay);
        ALEvent.GRAPHIC_OVERLAY_LAYER_ADDED.dispatchedTo(this.aladinDiv, {
          layer: overlay,
        });
      };

      Aladin.prototype.addMOC = function (moc) {
        this.view.addMOC(moc);
        ALEvent.GRAPHIC_OVERLAY_LAYER_ADDED.dispatchedTo(this.aladinDiv, {
          layer: moc,
        });
      }; // @API

      Aladin.prototype.findLayerByUUID = function (uuid) {
        var result = this.view.allOverlayLayers.filter(function (layer) {
          return layer.uuid === uuid;
        });

        if (result.length == 0) {
          return null;
        }

        return result[0];
      }; // @API

      Aladin.prototype.removeLayer = function (layer) {
        this.view.removeLayer(layer);
      }; // @oldAPI

      Aladin.prototype.createImageSurvey = function (id, name, rootUrl, cooFrame, maxOrder) {
        var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
        var cfg = this.cacheSurveys.get(id);

        if (!cfg) {
          if (cooFrame) {
            options.cooFrame = cooFrame;
          }

          this.cacheSurveys.set(id, {
            id: id,
            name: name,
            rootUrl: rootUrl,
            options: options,
          });
          return new HpxImageSurvey(id, name, rootUrl, this.view, options);
        } else {
          cfg = Utils.clone(cfg);
          return new HpxImageSurvey(cfg.id, cfg.name, cfg.rootUrl, this.view, cfg.options);
        }
      }; // @param imageSurvey : HpxImageSurvey object or image survey identifier
      // @api
      // @old

      Aladin.prototype.setImageSurvey = function (imageSurvey) {
        this.setBaseImageLayer(imageSurvey);
      }; // @api

      Aladin.prototype.removeImageSurvey = function (layer) {
        if (layer === "base") {
          throw "Cannot remove base survey layer.";
        }

        this.view.removeImageSurvey(layer);
      }; // @api

      Aladin.prototype.setBaseImageLayer = function (idOrSurvey) {
        this.setOverlayImageLayer(idOrSurvey, "base");
      }; // @api

      Aladin.prototype.getBaseImageLayer = function () {
        return this.view.getImageSurvey("base");
      }; // @api

      Aladin.prototype.setOverlayImageLayer = function (idOrUrlOrSurvey) {
        var layer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "overlay";
        var survey = null; // 1. User gives an ID

        if (typeof idOrUrlOrSurvey === "string") {
          var idOrUrl = idOrUrlOrSurvey; // Check if the survey has already been added
          // Create a new HpxImageSurvey

          var isUrl = false;

          if (idOrUrl.includes("http")) {
            isUrl = true;
          }

          var name = idOrUrl;

          if (isUrl) {
            var url = idOrUrl;
            var id = url; // Url

            survey = this.createImageSurvey(id, name, url, null, null);
          } else {
            var _id = idOrUrl; // ID

            survey = this.createImageSurvey(_id, name, undefined, null, null);
          } // 2. User gdves a non resolved promise
        } else {
          survey = idOrUrlOrSurvey;
        }

        this.view.setOverlayImageSurvey(survey, layer);
      }; // @api

      Aladin.prototype.getOverlayImageLayer = function () {
        var layer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "overlay";
        var survey = this.view.getImageSurvey(layer);
        return survey;
      }; // new!

      Aladin.prototype.getImageSurveyMeta = function () {
        var layer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "base";
        return this.view.getImageSurveyMeta(layer);
      };

      Aladin.prototype.setImageSurveyMeta = function (meta) {
        var layer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "base";
        return this.view.setImageSurveyMeta(layer, meta);
      }; // @api

      Aladin.prototype.increaseZoom = function () {
        this.view.increaseZoom();
      };

      Aladin.prototype.decreaseZoom = function () {
        this.view.decrepseZoom();
      }; // @api
      // Set the current layer that is targeted
      // Rightclicking for changing the cuts is done the targeted layer

      Aladin.prototype.setActiveHiPSLayer = function (layer) {
        this.view.setActiveHiPSLayer(layer);
      };

      Aladin.prototype.createProgressiveCatalog = function (url, frame, maxOrder, options) {
        return new ProgressiveCat(url, frame, maxOrder, options);
      };

      Aladin.prototype.createOverlay = function (options) {
        return new Overlay_Overlay(options);
      };

      Aladin.AVAILABLE_CALLBACKS = [
        "select",
        "objectClicked",
        "objectHovered",
        "footprintClicked",
        "footprintHovered",
        "positionChanged",
        "zoomChanged",
        "click",
        "mouseMove",
        "fullScreenToggled",
        "catalogReady",
      ]; // API
      //
      // setting callbacks

      Aladin.prototype.on = function (what, myFunction) {
        if (Aladin.AVAILABLE_CALLBACKS.indexOf(what) < 0) {
          return;
        }

        this.callbacksByEventName[what] = myFunction;
      };

      Aladin.prototype.select = function () {
        this.fire("selectstart");
      };

      Aladin.prototype.fire = function (what, params) {
        if (what === "selectstart") {
          this.view.setMode(View.SELECT);
        } else if (what === "selectend") {
          this.view.setMode(View.PAN);
          var callbackFn = this.callbacksByEventName["select"];
          typeof callbackFn === "function" && callbackFn(params);
        }
      };

      Aladin.prototype.hideBoxes = function () {
        if (this.boxes) {
          for (var k = 0; k < this.boxes.length; k++) {
            this.boxes[k].hide();
          }
        }
      }; // ?

      Aladin.prototype.updateCM = function () {}; // TODO : LayerBox (or Stack?) must be extracted as a separate object

      Aladin.prototype.showLayerBox = function () {
        this.stack.show();
      };

      Aladin.prototype.layerByName = function (name) {
        var c = this.view.allOverlayLayers;

        for (var k = 0; k < c.length; k++) {
          if (name == c[k].name) {
            return c[k];
          }
        }

        return null;
      }; // TODO : integrate somehow into API ?

      Aladin.prototype.exportAsPNG = function (imgFormat) {
        var w = window.open();
        w.document.write('<img src="' + this.getViewDataURL() + '">');
        w.document.title = "Aladin Lite snapshot";
      };
      /**
       * Return the current view as a data URL (base64-formatted string)
       * Parameters:
       * - options (optional): object with attributs
       *     * format (optional): 'image/png' or 'image/jpeg'
       *     * width: width in pixels of the image to output
       *     * height: height in pixels of the image to output
       *
       * @API
       */

      Aladin.prototype.getViewDataURL = function (options) {
        var options = options || {}; // support for old API signature

        if (Aladin_typeof(options) !== "object") {
          var imgFormat = options;
          options = {
            format: imgFormat,
          };
        }

        return this.view.getCanvasDataURL(options.format, options.width, options.height);
      };
      /**
       * Return the current view WCS as a key-value dictionary
       * Can be useful in coordination with getViewDataURL
       *
       * @API
       */

      Aladin.prototype.getViewWCS = function (options) {
        var raDec = this.getRaDec();
        var fov = this.getFov(); // TODO: support for other projection methods than SIN

        return {
          NAXIS: 2,
          NAXIS1: this.view.width,
          NAXIS2: this.view.height,
          RADECSYS: "ICRS",
          CRPIX1: this.view.width / 2,
          CRPIX2: this.view.height / 2,
          CRVAL1: raDec[0],
          CRVAL2: raDec[1],
          CTYPE1: "RA---SIN",
          CTYPE2: "DEC--SIN",
          CD1_1: fov[0] / this.view.width,
          CD1_2: 0.0,
          CD2_1: 0.0,
          CD2_2: fov[1] / this.view.height,
        };
      };
      /** restrict FOV range
       * @API
       * @param minFOV in degrees when zoom in at max
       * @param maxFOV in degreen when zoom out at max
       */

      Aladin.prototype.setFovRange = Aladin.prototype.setFOVRange = function (minFOV, maxFOV) {
        if (minFOV > maxFOV) {
          var tmp = minFOV;
          minFOV = maxFOV;
          maxFOV = tmp;
        }

        this.view.minFOV = minFOV;
        this.view.maxFOV = maxFOV;
      };
      /**
       *5Transform pixel coordinates to world coordinates
       *
       * Origin (0,0) of pixel coordinates is at top left corner of Aladin Lite view
       *
       * @API
       *
       * @param x
       * @param y
       *
       * @return a [ra, dec] array with world coordinates in degrees. Returns undefined is something went wrong
       *
       */

      Aladin.prototype.pix2world = function (x, y) {
        // this might happen at early stage of initialization
        if (!this.view) {
          return undefined;
        }

        try {
          //radec = this.view.projection.unproject(xy.x, xy.y);
          return this.view.aladin.webglAPI.screenToWorld(x, y);
        } catch (e) {
          return undefined;
        }
      };
      /**
       * Transform world coordinates to pixel coordinates in the view
       *
       * @API
       *
       * @param ra
       * @param dec
       *
       * @return a [x, y] array with pixel coordinates in the view. Returns null if the projection failed somehow
       *
       */

      Aladin.prototype.world2pix = function (ra, dec) {
        // this might happen at early stage of initialization
        if (!this.view) {
          return;
        }

        var xy;

        if (this.view.cooFrame == CooFrameEnum.GAL) {
          var lonlat = CooConversion.J2000ToGalactic([ra, dec]);
          xy = this.view.projection.project(lonlat[0], lonlat[1]);
        } else {
          xy = this.view.projection.project(ra, dec);
        }

        if (xy) {
          var xyview = AladinUtils.xyToView(xy.X, xy.Y, this.view.width, this.view.height, this.view.largestDim, this.view.zoomFactor);
          return [xyview.vx, xyview.vy];
        } else {
          return null;
        }
      };
      /**
       *
       * @API
       *
       * @param ra
       * @param nbSteps the number of points to return along each side (the total number of points returned is 4*nbSteps)
       *
       * @return set of points along the current FoV with the following format: [[ra1, dec1], [ra2, dec2], ..., [ra_n, dec_n]]
       *
       */

      Aladin.prototype.getFovCorners = function (nbSteps) {
        // default value: 1
        if (!nbSteps || nbSteps < 1) {
          nbSteps = 1;
        }

        var points = [];
        var x1, y1, x2, y2;

        for (var k = 0; k < 4; k++) {
          x1 = k == 0 || k == 3 ? 0 : this.view.width - 1;
          y1 = k < 2 ? 0 : this.view.height - 1;
          x2 = k < 2 ? this.view.width - 1 : 0;
          y2 = k == 1 || k == 2 ? this.view.height - 1 : 0;

          for (var step = 0; step < nbSteps; step++) {
            var radec = this.webglAPI.screenToWorld(x1 + (step / nbSteps) * (x2 - x1), y1 + (step / nbSteps) * (y2 - y1));
            points.push(radec);
          }
        }

        return points;
      };
      /**
       * @API
       *
       * @return the current FoV size in degrees as a 2-elements array
       */

      Aladin.prototype.getFov = function () {
        var fovX = this.view.fov;
        var s = this.getSize();
        var fovY = (s[1] / s[0]) * fovX; // TODO : take into account AITOFF projection where fov can be larger than 180

        fovX = Math.min(fovX, 180);
        fovY = Math.min(fovY, 180);
        return [fovX, fovY];
      };
      /**
       * @API
       *
       * @return the size in pixels of the Aladin Lite view
       */

      Aladin.prototype.getSize = function () {
        return [this.view.width, this.view.height];
      };
      /**
       * @API
       *
       * 7return the jQuery object representing the DIV element where the Aladin Lite instance lies
       */

      Aladin.prototype.getParentDiv = function () {
        return $(this.aladinDiv);
      };

      return Aladin;
    })(); ///////////////////////////////
    /////// Aladin Lite API ///////
    ///////////////////////////////

    var Aladin_A = {}; //// New API ////
    // For developers using Aladin lite: all objects should be created through the API,
    // rather than creating directly the corresponding JS objects
    // This facade allows for more flexibility as objects can be updated/renamed harmlessly
    //@API

    Aladin_A.aladin = function (divSelector, options) {
      return new Aladin($(divSelector)[0], options);
    };
    /*//@API
// TODO : lecture de properties
A.imageLayer = function (rootURLOrHiPSDefinition, options) {
    return new HpxImageSurvey(rootURLOrHiPSDefinition, null, null, options);
};*/
    // @API

    Aladin_A.source = function (ra, dec, data, options) {
      return new Source(ra, dec, data, options);
    }; // @API

    Aladin_A.marker = function (ra, dec, options, data) {
      options = options || {};
      options["marker"] = true;
      return Aladin_A.source(ra, dec, data, options);
    };
    /*
A.createImageSurvey = async function(rootUrlOrId, options) {
    const survey = await HpxImageSurvey.create(rootUrlOrId, options);
    return survey;
}
*/
    // @API

    Aladin_A.polygon = function (raDecArray) {
      var l = raDecArray.length;

      if (l > 0) {
        // close the polygon if needed
        if (raDecArray[0][0] != raDecArray[l - 1][0] || raDecArray[0][1] != raDecArray[l - 1][1]) {
          raDecArray.push([raDecArray[0][0], raDecArray[0][1]]);
        }
      }

      return new Footprint(raDecArray);
    }; //@API

    Aladin_A.polyline = function (raDecArray, options) {
      return new Polyline(raDecArray, options);
    }; // @API

    Aladin_A.circle = function (ra, dec, radiusDeg, options) {
      return new Circle([ra, dec], radiusDeg, options);
    };
    /**
     *
     * @API
     *
     * @param ra
     * @param dec
     * @param radiusRaDeg the radius along the ra axis in degrees
     * @param radiusDecDeg the radius along the dec axis in degrees
     * @param rotationDeg the rotation angle in degrees
     *
     */

    Aladin_A.ellipse = function (ra, dec, radiusRaDeg, radiusDecDeg, rotationDeg, options) {
      return new Ellipse([ra, dec], radiusRaDeg, radiusDecDeg, rotationDeg, options);
    }; // @API

    Aladin_A.graphicOverlay = function (options) {
      return new Overlay_Overlay(options);
    }; // @API

    Aladin_A.catalog = function (options) {
      return new Catalog(options);
    }; // @API

    Aladin_A.catalogHiPS = function (rootURL, options) {
      return new ProgressiveCat(rootURL, null, null, options);
    }; //0@API

    Aladin_A.Footprint = function (options) {
      return new Footprint(options);
    }; // @API

    /*
     * return a Box GUI element to insert content
     */

    Aladin.prototype.box = function (options) {
      var box = new Box(options);
      box.$parentDiv.appendTo(this.aladinDiv);
      return box;
    }; // @API

    /*
     * show popup at ra, dec position with given title and content
     */

    Aladin.prototype.showPopup = function (ra, dec, title, content) {
      this.view.catalogForPopup.removeAll();
      var marker = Aladin_A.marker(ra, dec, {
        popupTitle: title,
        popupDesc: content,
        useMarkerDefaultIcon: false,
      });
      this.view.catalogForPopup.addSources(marker);
      this.view.catalogForPopup.show();
      this.view.popup.setTitle(title);
      this.view.popup.setText(content);
      this.view.popup.setSource(marker);
      this.view.popup.show();
    }; // @API

    /*
     * hide popup
     */

    Aladin.prototype.hidePopup = function () {
      this.view.popup.hide();
    }; // @API

    /*
     * return a URL allowing to share the current view
     */

    Aladin.prototype.getShareURL = function () {
      var radec = this.getRaDec();
      var coo = new coo_Coo();
      coo.prec = 7;
      coo.lon = radec[0];
      coo.lat = radec[1];
      return (
        "https://aladin.unistra.fr/AladinLite/?target=" +
        encodeURIComponent(coo.format("s")) +
        "&fov=" +
        this.getFov()[0].toFixed(2) +
        "&survey=" +
        encodeURIComponent(this.getBaseImageLayer().id || this.getBaseImageLayer().rootUrl)
      );
    }; // @API

    /*
     * return, as a string, the HTML embed code
     */

    Aladin.prototype.getEmbedCode = function () {
      var radec = this.getRaDec();
      var coo = new coo_Coo();
      coo.prec = 7;
      coo.lon = radec[0];
      coo.lat = radec[1];
      var survey = this.getBaseImageLayer().id;
      var fov = this.getFov()[0];
      var s = "";
      s += '<link rel="stylesheet" href="https://aladin.unistra.fr/AladinLite/api/v2/latest/aladin.min.css" />\n';
      s += '<script type="text/javascript" src="https://code.jquery.com/jquery-1.9.1.min.js" charset="utf-8"></script>\n';
      s += '<div id="aladin-lite-div" style="width:400px;height:400px;"></div>\n';
      s += '<script type="text/javascript" src="https://aladin.unistra.fr/AladinLite/api/v2/latest/aladin.min.js" charset="utf-8"></script>\n';
      s += '<script type="text/javascript">\n';
      s +=
        'var aladin = A.aladin("#aladin-lite-div", {survey: "' +
        survey +
        'P/DSS2/color", fov: ' +
        fov.toFixed(2) +
        ', target: "' +
        coo.format("s") +
        '"});\n';
      s += "</script>";
      return s;
    }; // @API

    /*
     * Creates remotely a HiPS from a FITS image URL and displays it
     */

    Aladin.prototype.displayFITS = function (url, options, successCallback, errorCallback) {
      options = options || {};
      var data = {
        url: url,
      };

      if (options.color) {
        data.color = true;
      }

      if (options.outputFormat) {
        data.format = options.outputFormat;
      }

      if (options.order) {
        data.order = options.order;
      }

      if (options.nocache) {
        data.nocache = options.nocache;
      }

      var self = this;

      var request = function request(url) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "GET";
        var options = {
          method: method,
        };

        if ("GET" === method) {
          url += "?" + new URLSearchParams(params).toString();
        } else {
          options.body = JSON.stringify(params);
        }

        return fetch(url, options).then(function (response) {
          return response.json();
        });
      };

      var get = function get(url, params) {
        return request(url, params, "GET");
      };

      get("https://alasky.unistra.fr/cgi/fits2HiPS", data).then(
        /*#__PURE__*/ (function () {
          var _ref = Aladin_asyncToGenerator(
            /*#__PURE__*/ Aladin_regeneratorRuntime().mark(function _callee(response) {
              var label, meta, survey, transparency, executeDefaultSuccessAction;
              return Aladin_regeneratorRuntime().wrap(function _callee$(_context) {
                while (1) {
                  switch ((_context.prev = _context.next)) {
                    case 0:
                      if (!(response.status != "success")) {
                        _context.next = 4;
                        break;
                      }

                      console.error("An error occured: " + response.message);

                      if (errorCallback) {
                        errorCallback(response.message);
                      }

                      return _context.abrupt("return");

                    case 4:
                      label = options.label || "FITS image";
                      meta = response.data.meta;
                      survey = self.createImageSurvey(response.data.url, label);
                      self.setOverlayImageLayer(survey, "overlay");
                      transparency = (options && options.transparency) || 1.0;
                      executeDefaultSuccessAction = true;

                      if (successCallback) {
                        executeDefaultSuccessAction = successCallback(meta.ra, meta.dec, meta.fov);
                      }

                      if (executeDefaultSuccessAction === true) {
                        self.webglAPI.setCenter(meta.ra, meta.dec);
                        self.setFoV(meta.fov);
                      } // TODO! set an image survey once the already loaded surveys
                    // are READY! Otherwise it can lead to some congestion and avoid
                    // downloading the base tiles of the other surveys loading!
                    // This has to be fixed in the backend but a fast fix is just to wait
                    // before setting a new image survey

                    case 12:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee);
            })
          );

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })()
      );
    }; // @API

    /*
     * Creates remotely a HiPS from a JPEG or PNG image with astrometry info
     * and display it
     */

    Aladin.prototype.displayJPG = Aladin.prototype.displayPNG = function (url, options, successCallback, errorCallback) {
      options = options || {};
      options.color = true;
      options.label = "JPG/PNG image";
      options.outputFormat = "png";
      this.displayFITS(url, options, successCallback, errorCallback);
    };

    Aladin.prototype.setReduceDeformations = function (reduce) {
      this.reduceDeformations = reduce;
      this.view.requestRedraw();
    }; // API

    Aladin_A.footprintsFromSTCS = function (stcs) {
      var footprints = Overlay_Overlay.parseSTCS(stcs);
      return footprints;
    }; // API

    Aladin_A.MOCFromURL = function (url, options, successCallback) {
      var moc = new MOC(options);
      moc.dataFromFITSURL(url, successCallback);
      return moc;
    }; // API

    Aladin_A.MOCFromJSON = function (jsonMOC, options) {
      var moc = new MOC(options);
      moc.dataFromJSON(jsonMOC);
      return moc;
    }; // TODO: try first without proxy, and then with, if param useProxy not set
    // API

    Aladin_A.catalogFromURL = function (url, options, successCallback, useProxy) {
      var catalog = Aladin_A.catalog(options); // TODO: should be self-contained in Catalog class

      Catalog.parseVOTable(
        url,
        function (sources) {
          catalog.addSources(sources);

          if (successCallback) {
            successCallback(sources);
          }
        },
        catalog.maxNbSources,
        useProxy,
        catalog.raField,
        catalog.decField
      );
      return catalog;
    }; // API
    // @param target: can be either a string representing a position or an object name, or can be an object with keys 'ra' and 'dec' (values being in decimal degrees)

    Aladin_A.catalogFromSimbad = function (target, radius, options, successCallback) {
      options = options || {};

      if (!("name" in options)) {
        options["name"] = "Simbad";
      }

      var url = URLBuilder.buildSimbadCSURL(target, radius);
      return Aladin_A.catalogFromURL(url, options, successCallback, false);
    }; // API

    Aladin_A.catalogFromNED = function (target, radius, options, successCallback) {
      options = options || {};

      if (!("name" in options)) {
        options["name"] = "NED";
      }

      var url;

      if (target && Aladin_typeof(target) === "object") {
        if ("ra" in target && "dec" in target) {
          url = URLBuilder.buildNEDPositionCSURL(target.ra, target.dec, radius);
        }
      } else {
        var isObjectName = /[a-zA-Z]/.test(target);

        if (isObjectName) {
          url = URLBuilder.buildNEDObjectCSURL(target, radius);
        } else {
          var coo = new coo_Coo();
          coo.parse(target);
          url = URLBuilder.buildNEDPositionCSURL(coo.lon, coo.lat, radius);
        }
      }

      return Aladin_A.catalogFromURL(url, options, successCallback);
    }; // API

    Aladin_A.catalogFromVizieR = function (vizCatId, target, radius, options, successCallback) {
      options = options || {};

      if (!("name" in options)) {
        options["name"] = "VizieR:" + vizCatId;
      }

      var url = URLBuilder.buildVizieRCSURL(vizCatId, target, radius, options);
      console.log(url);
      return Aladin_A.catalogFromURL(url, options, successCallback, false);
    }; // API

    Aladin_A.catalogFromSkyBot = function (ra, dec, radius, epoch, queryOptions, options, successCallback) {
      queryOptions = queryOptions || {};
      options = options || {};

      if (!("name" in options)) {
        options["name"] = "SkyBot";
      }

      var url = URLBuilder.buildSkyBotCSURL(ra, dec, radius, epoch, queryOptions);
      return Aladin_A.catalogFromURL(url, options, successCallback, false);
    };

    Aladin_A.hipsDefinitionFromURL = function (url, successCallback) {
      HiPSDefinition.fromURL(url, successCallback);
    };

    Aladin_A.init = Aladin_asyncToGenerator(
      /*#__PURE__*/ Aladin_regeneratorRuntime().mark(function _callee2() {
        return Aladin_regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) {
            switch ((_context2.prev = _context2.next)) {
              case 0:
                _context2.next = 2;
                return WebGLCtx();

              case 2:
                Aladin.wasmLibs.webgl = _context2.sent;

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      })
    )(); // this is ugly for sure and there must be a better way (export A ??)

    window.A = Aladin_A;
  })();

  /******/
})();
//# sourceMappingURL=aladin.js.map
