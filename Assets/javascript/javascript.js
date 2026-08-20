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
    
    // সার্চ এলিমেন্টস
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const noResults = document.getElementById("noResults");

    let activeVideoList = [];
    let currentVideoIndex = 0;
    let isScrolling = false;

    // ১. সার্চ লজিক ফংশন
    function performSearch() {
        if (!searchInput) return;

        const query = searchInput.value.toLowerCase().trim();
        let matchCount = 0;

        videoCards.forEach((card) => {
            const title = (card.getAttribute("data-title") || card.querySelector(".video-title")?.textContent || "").toLowerCase();

            if (title.includes(query)) {
                card.style.display = ""; // ভিডিও কার্ড দেখাবে
                matchCount++;
            } else {
                card.style.display = "none"; // হাইড করবে
            }
        });

        if (noResults) {
            noResults.style.display = matchCount === 0 ? "flex" : "none";
        }

        updateActiveVideoList();
    }

    // ২. অ্যাক্টিভ ভিডিও তালিকা আপডেট
    function updateActiveVideoList() {
        activeVideoList = [];
        let index = 0;

        videoCards.forEach((card) => {
            if (card.style.display !== "none") {
                const title = card.getAttribute("data-title") || card.querySelector(".video-title")?.textContent;
                const previewVideo = card.querySelector("video");
                const fullSrc = card.getAttribute("data-src") || (previewVideo ? previewVideo.src : "");

                activeVideoList.push({ title, src: fullSrc, cardElement: card });

                const currentIndex = index;
                card.onclick = () => {
                    openModal(currentIndex);
                };

                index++;
            }
        });
    }

    // ৩. ইভেন্ট লিসেনার সেটআপ
    if (searchInput) {
        searchInput.addEventListener("input", performSearch);
        searchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") performSearch();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", performSearch);
    }

    // ৪. হোভার প্লে সেটআপ
    videoCards.forEach((card) => {
        const previewVideo = card.querySelector("video");
        if (!previewVideo) return;

        card.addEventListener("mouseenter", () => {
            previewVideo.muted = true;
            previewVideo.play().catch(() => {});
        });

        card.addEventListener("mouseleave", () => {
            previewVideo.pause();
            previewVideo.currentTime = 0;
        });
    });

    updateActiveVideoList();

    // ৫. মোডাল প্লেয়ার
    function openModal(index) {
        if (index < 0 || index >= activeVideoList.length) return;

        currentVideoIndex = index;
        const item = activeVideoList[currentVideoIndex];

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

    // ৬. স্ক্রোল নেভিগেশন
    if (videoWrapper) {
        videoWrapper.addEventListener("wheel", (e) => {
            if (!videoModal.classList.contains("active") || isScrolling) return;

            isScrolling = true;
            setTimeout(() => { isScrolling = false; }, 600);

            if (e.deltaY > 0) {
                if (currentVideoIndex < activeVideoList.length - 1) openModal(currentVideoIndex + 1);
            } else {
                if (currentVideoIndex > 0) openModal(currentVideoIndex - 1);
            }
        });
    }

    // ৭. ১০ সেকেন্ড স্কিপ কন্ট্রোল
    function skipTime(seconds, indicator) {
        modalVideo.currentTime += seconds;
        if (indicator) {
            indicator.classList.add("show");
            setTimeout(() => indicator.classList.remove("show"), 500);
        }
    }

    if (rewindBtn) rewindBtn.addEventListener("click", () => skipTime(-10, skipLeft));
    if (forwardBtn) forwardBtn.addEventListener("click", () => skipTime(10, skipRight));

    // ৮. মোডাল বাটন
    if (maxBtn) {
        maxBtn.addEventListener("click", () => {
            if (!document.fullscreenElement) {
                modalVideo.requestFullscreen?.();
            } else {
                document.exitFullscreen?.();
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