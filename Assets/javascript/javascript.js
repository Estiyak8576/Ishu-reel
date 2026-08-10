document.addEventListener("DOMContentLoaded", () => {
    const videoCards = document.querySelectorAll(".video-card");
    const videoModal = document.getElementById("videoModal");
    const modalVideo = document.getElementById("modalVideo");
    const modalVideoTitle = document.getElementById("modalVideoTitle");
    const closeBtn = document.getElementById("closeBtn");
    const minusBtn = document.getElementById("minusBtn");
    const maxBtn = document.getElementById("maxBtn");
    const rewindBtn = document.getElementById("rewindBtn");
    const forwardBtn = document.getElementById("forwardBtn");
    const skipLeft = document.getElementById("skipLeft");
    const skipRight = document.getElementById("skipRight");
    const videoWrapper = document.getElementById("videoWrapper");

    let videoDataList = [];
    let currentVideoIndex = 0;
    let isScrolling = false;

    // ১. ভিডিও ডাটা রিড করা এবং কার্ডে হোভার প্রিভিউ
    videoCards.forEach((card, index) => {
        const previewVideo = card.querySelector("video");
        const title = card.getAttribute("data-title");
        const fullSrc = card.getAttribute("data-src") || previewVideo.src;

        videoDataList.push({ title, src: fullSrc, index });

        card.addEventListener("mouseenter", () => {
            previewVideo.muted = true;
            previewVideo.play().catch(() => {});
        });

        card.addEventListener("mouseleave", () => {
            previewVideo.pause();
            previewVideo.currentTime = 0;
        });

        card.addEventListener("click", () => {
            openModal(index);
        });
    });

    // ২. মোডালে রিলে নির্দিষ্ট ভিডিওটি প্লে করা
    function openModal(index) {
        if (index < 0 || index >= videoDataList.length) return;

        currentVideoIndex = index;
        const item = videoDataList[currentVideoIndex];

        modalVideo.src = item.src;
        modalVideoTitle.textContent = item.title;
        videoModal.classList.add("active");
        videoModal.classList.remove("minimized");

        modalVideo.load();
        modalVideo.muted = false; 
        
        const playPromise = modalVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                modalVideo.muted = true;
                modalVideo.play();
            });
        }
    }

    // ৩. রিলস মাউস স্ক্রোল লজিক (পরের ও আগের ভিডিওতে সুইচ করা)
    videoWrapper.addEventListener("wheel", (e) => {
        if (!videoModal.classList.contains("active") || isScrolling) return;

        isScrolling = true;
        setTimeout(() => { isScrolling = false; }, 600);

        if (e.deltaY > 0) {
            if (currentVideoIndex < videoDataList.length - 1) {
                openModal(currentVideoIndex + 1);
            }
        } else {
            if (currentVideoIndex > 0) {
                openModal(currentVideoIndex - 1);
            }
        }
    });

    // ৪. মোবাইল টাচ সোয়াইপ লজিক (Up/Down Swipe)
    let touchStartY = 0;
    let touchEndY = 0;

    videoWrapper.addEventListener("touchstart", (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, false);

    videoWrapper.addEventListener("touchend", (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeDistance = touchStartY - touchEndY;
        if (Math.abs(swipeDistance) > 50) {
            if (swipeDistance > 0) {
                if (currentVideoIndex < videoDataList.length - 1) {
                    openModal(currentVideoIndex + 1);
                }
            } else {
                if (currentVideoIndex > 0) {
                    openModal(currentVideoIndex - 1);
                }
            }
        }
    }

    // ৫. ১০ সেকেন্ড স্কিপ কন্ট্রোল
    function skipTime(seconds, indicator) {
        modalVideo.currentTime += seconds;
        indicator.classList.add("show");
        setTimeout(() => indicator.classList.remove("show"), 500);
    }

    if (rewindBtn) rewindBtn.addEventListener("click", () => skipTime(-10, skipLeft));
    if (forwardBtn) forwardBtn.addEventListener("click", () => skipTime(10, skipRight));

    // ৬. ফুলস্ক্রিন, মিনিমাইজ ও ক্লোজ বাটন
    if (maxBtn) {
        maxBtn.addEventListener("click", () => {
            if (!document.fullscreenElement) {
                if (modalVideo.requestFullscreen) {
                    modalVideo.requestFullscreen();
                }
            } else {
                document.exitFullscreen();
            }
        });
    }

    if (minusBtn) {
        minusBtn.addEventListener("click", () => {
            videoModal.classList.toggle("minimized");
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            videoModal.classList.remove("active", "minimized");
            modalVideo.pause();
            modalVideo.src = "";
        });
    }
});