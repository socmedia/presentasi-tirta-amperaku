document.addEventListener("DOMContentLoaded", function () {
  (function () {
    const slides = document.querySelectorAll(".slide");
    const progressBar = document.getElementById("progressBar");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const btnNextCenter = document.getElementById("btnNextCenter");
    const footer = document.getElementById("footer");

    let currentIndex = 0;
    let isAnimating = false;
    const slidesCount = slides.length;

    // Initial Animation: Only show first slide (index 0) at first load. Hide progress bar.
    setTimeout(() => {
      animateSlideIn(0); // Animate first slide
      updateProgressBar(0);
    }, 1000);

    // Controls
    const handleNext = () => changeSlide("next");
    const handlePrev = () => changeSlide("prev");

    btnNext.addEventListener("click", handleNext);
    btnNextCenter.addEventListener("click", handleNext);
    btnPrev.addEventListener("click", handlePrev);

    // Keyboard Support (add Enter and Space next to ArrowRight)
    window.addEventListener("keydown", (e) => {
      // Limit slide navigation to index 1-11 on keys, 0 only via reset
      if (
        e.key === "ArrowRight" ||
        e.key === "Enter" ||
        e.key === " " ||
        e.code === "Space"
      ) {
        handleNext();
      }
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "r" || e.key === "R") {
        resetToFirstSlide();
      }
    });

    function changeSlide(direction) {
      if (isAnimating) return;

      // Only allow to go from index 0 to 1, and only allow next/prev from 1 to slidesCount-1
      let nextIndex;
      if (direction === "next") {
        if (currentIndex === 0) {
          nextIndex = 1;
        } else if (currentIndex >= slidesCount - 1) {
          return; // Stop at last slide (index 11 for 12 slides)
        } else {
          nextIndex = currentIndex + 1;
        }
      } else {
        if (currentIndex === 1) {
          nextIndex = 0;
        } else if (currentIndex <= 1) {
          return; // Don't go left from 0 or below 1 except for allowed case to 0
        } else {
          nextIndex = currentIndex - 1;
        }
      }

      // Only allow 0 once: from 1 to 0, but can't go to 0 repeatedly
      if (nextIndex === 0 && currentIndex !== 1) return;

      goToSlide(nextIndex);
    }

    function updateProgressBar(index) {
      // Hide progress bar on slide 0, show otherwise
      if (index === 0) {
        progressBar.style.opacity = "0";
        progressBar.style.width = "0%";
      } else {
        progressBar.style.opacity = "1";
        // Actual progress for slides 1 to slidesCount-1 (1-11)
        const percent = (index / (slidesCount - 1)) * 100;
        progressBar.style.width = `${percent}%`;
      }

      // Hide footer on slide 0, show otherwise
      if (footer) {
        if (index === 0) {
          footer.style.display = "none";
        } else {
          footer.style.display = "";
        }
      }
    }

    function goToSlide(index) {
      if (isAnimating || index === currentIndex) return;
      isAnimating = true;

      const currentSlide = slides[currentIndex];
      const nextSlide = slides[index];

      // Animate Out (use slide's animation type if defined)
      const outAnim = currentSlide.getAttribute("data-anim") || "slideUp";
      let outProps = { autoAlpha: 0, duration: 0.5, ease: "power2.in" };
      if (outAnim.startsWith("parallax")) {
        if (outAnim === "parallaxX") {
          outProps = {
            autoAlpha: 0,
            x: 120,
            duration: 0.5,
            ease: "power2.in",
          };
        } else {
          outProps = {
            autoAlpha: 0,
            y: 60,
            duration: 0.5,
            ease: "power2.in",
          };
        }
      }
      gsap.to(currentSlide, {
        ...outProps,
        onComplete: () => {
          currentSlide.classList.remove("active-slide");
          currentIndex = index;
          nextSlide.classList.add("active-slide");
          updateProgressBar(index);
          animateSlideIn(index);
          gsap.set(currentSlide, { clearProps: "all" });
          setTimeout(() => {
            isAnimating = false;
          }, 600);
        },
      });
    }

    // Reset to first slide on 'R' key
    function resetToFirstSlide() {
      if (isAnimating || currentIndex === 0) return;

      const currentSlide = slides[currentIndex];
      const firstSlide = slides[0];

      isAnimating = true;

      // Animate out current slide
      const outAnim = currentSlide.getAttribute("data-anim") || "slideUp";
      let outProps = { autoAlpha: 0, duration: 0.5, ease: "power2.in" };
      if (outAnim.startsWith("parallax")) {
        if (outAnim === "parallaxX") {
          outProps = {
            autoAlpha: 0,
            x: 120,
            duration: 0.5,
            ease: "power2.in",
          };
        } else {
          outProps = {
            autoAlpha: 0,
            y: 60,
            duration: 0.5,
            ease: "power2.in",
          };
        }
      }

      gsap.to(currentSlide, {
        ...outProps,
        onComplete: () => {
          currentSlide.classList.remove("active-slide");
          currentIndex = 0;
          firstSlide.classList.add("active-slide");
          updateProgressBar(0);
          animateSlideIn(0);
          gsap.set(currentSlide, { clearProps: "all" });
          setTimeout(() => {
            isAnimating = false;
          }, 600);
        },
      });
    }

    // Helper: Animate cards one by one if exist
    function animateCardsIn(slide, delay = 0.2, cardStagger = 0.18) {
      // For containers with class 'anim-cards-parent'
      const parents = slide.querySelectorAll(".anim-cards-parent");
      parents.forEach((parent) => {
        const cards = parent.querySelectorAll(".anim-card");
        if (cards.length > 0) {
          gsap.set(cards, { opacity: 0, y: 32 });
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: cardStagger,
            delay: delay,
            ease: "power3.out",
          });
        }
      });

      // Animate all .anim-card elements in the slide with slide-up effect regardless of anim-cards-parent
      const allCards = slide.querySelectorAll(".anim-card");
      if (allCards.length > 0) {
        gsap.set(allCards, { opacity: 0, y: 32 });
        gsap.to(allCards, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: cardStagger,
          delay: delay,
          ease: "power3.out",
        });
      }
    }

    function animateTimelineSlide(slide) {
      // Animation for Timeline (Slide 2 - Index 1, @file_context_0)
      // Animate timeline bar and points, as in @file_context_0
      const progress = slide.querySelector(".timeline-progress");
      const points = slide.querySelectorAll(".timeline-point");
      if (progress && points.length) {
        gsap.set(progress, { width: "0%" });
        gsap.set(points, { opacity: 0, y: 30 });
        gsap.to(progress, {
          width: "100%",
          duration: 1.2,
          delay: 0.4,
          ease: "power2.inOut",
        });
        gsap.to(points, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.3,
          delay: 0.6,
          ease: "back.out(1.7)",
        });
      }
    }

    function animateSlideIn(index) {
      const activeSlide = slides[index];
      if (!activeSlide) return;

      gsap.set(activeSlide, { autoAlpha: 1 });

      const elements = activeSlide.querySelectorAll(".slide-elem");
      const bg = activeSlide.querySelector(".bg-img");
      const animType = activeSlide.getAttribute("data-anim") || "slideUp";

      // Prepare
      if (elements.length > 0) gsap.set(elements, { opacity: 0, y: 0, x: 0 });

      // BG Parallax Prep
      if (bg) gsap.set(bg, { scale: 1.1, y: 0, x: 0 });

      // Animate BG (slow scale)
      if (bg) {
        gsap.to(bg, { scale: 1.05, duration: 10, ease: "none" });
      }

      // Parallax & Slide Variants for Slide In
      if (animType === "parallaxX") {
        if (bg)
          gsap.fromTo(
            bg,
            { x: -60, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
          );
        if (elements.length > 0) {
          gsap.fromTo(
            elements,
            { x: 80, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.1,
              ease: "power3.out",
              delay: 0.2,
            }
          );
        }
      } else if (animType === "parallaxY") {
        if (bg)
          gsap.fromTo(
            bg,
            { y: 80, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
          );
        if (elements.length > 0) {
          gsap.fromTo(
            elements,
            { y: 70, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.1,
              ease: "power3.out",
              delay: 0.2,
            }
          );
        }
      } else {
        if (elements.length > 0) {
          gsap.fromTo(
            elements,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.1,
              ease: "power3.out",
              delay: 0.2,
            }
          );
        }
      }

      // Animation for Timeline (Slide 2 - Index 1, @file_context_0)
      if (index === 1) {
        animateTimelineSlide(activeSlide);
      }

      // Animate all cards with a slide-up effect on every slide
      const allCards = activeSlide.querySelectorAll(".anim-card");
      if (allCards.length > 0) {
        gsap.set(allCards, { opacity: 0, y: 32 });
        gsap.to(allCards, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.16,
          delay: 0.2,
          ease: "power3.out",
        });
      }

      // -- Custom animation: Cards one by one for slides that have card-group --
      // (still use their delays for legacy/custom stagger timing)
      // SLIDE 3 (Perubahan & Nilai Baru, index starts from 0, so 2 is 3rd slide)
      if (index === 2) animateTimelineSlide(activeSlide, 0.4, 0.18);
      // SLIDE 4 (Misi Perusahaan)
      if (index === 3) animateCardsIn(activeSlide, 0.5, 0.13);
      // SLIDE 6 (Fitur Pengaduan) - Only two cards
      if (index === 5) animateCardsIn(activeSlide, 0.5, 0.2);
      // SLIDE 8 (Fitur Pasang Baru) - Steps card
      if (index === 7) animateCardsIn(activeSlide, 0.48, 0.15);
      // SLIDE 10 (Fitur Lainnya) - Fitur grid
      if (index === 9) animateCardsIn(activeSlide, 0.45, 0.14);
    }
  })();
});
