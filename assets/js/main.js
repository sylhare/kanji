(function immediatelyInvokedFunctionExpression() {
  "use strict";

  console.log("start");

  function closestEl(el, selector) {
    var doc = el.document || el.ownerDocument;
    var matches = doc.querySelectorAll(selector);
    var i;
    while (el) {
      i = matches.length - 1;
      while (i >= 0) {
        if (matches.item(i) === el) {
          return el;
        }
        i -= 1;
      }
      el = el.parentElement;
    }
    return el;
  }

  var modalBtns = document.querySelectorAll(".modal-button");
  modalBtns.forEach(function addBtnClickEvent(btn) {
    btn.onclick = function showModal() {
      console.log("modal");
      var modal = btn.getAttribute("data-modal");
      document.getElementById(modal).style.display = "block";
    };
  });

  var closeBtns = document.querySelectorAll(".close");
  closeBtns.forEach(function addCloseClickEvent(btn) {
    btn.onclick = function closeModal() {
      console.log("close");
      var modal = closestEl(btn, ".modal");
      modal.style.display = "none";
    };
  });

  window.onclick = function closeOnClick(event) {
    if (event.target.className === "modal") {
      console.log("other");
      event.target.style.display = "none";
    }
  };
}());


// lazy load: https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video
document.addEventListener("DOMContentLoaded", function () {
  let lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.srcset = lazyImage.dataset.srcset;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function (lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    let active = false;

    const lazyLoad = function () {
      if (active === false) {
        active = true;

        setTimeout(function () {
          lazyImages.forEach(function (lazyImage) {
            if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== "none") {
              lazyImage.src = lazyImage.dataset.src;
              lazyImage.srcset = lazyImage.dataset.srcset;
              lazyImage.classList.remove("lazy");

              lazyImages = lazyImages.filter(function (image) {
                return image !== lazyImage;
              });

              if (lazyImages.length === 0) {
                document.removeEventListener("scroll", lazyLoad);
                window.removeEventListener("resize", lazyLoad);
                window.removeEventListener("orientationchange", lazyLoad);
              }
            }
          });

          active = false;
        }, 200);
      }
    };

    document.addEventListener("scroll", lazyLoad);
    window.addEventListener("resize", lazyLoad);
    window.addEventListener("orientationchange", lazyLoad);
  }
});


