/* =========================================================
   Minimal vanilla JavaScript.
   No framework, no external dependency.
   主页横幅照片轮播、页面切换上滑动画、论文分页、
   设备图片放大查看、页脚年份。
   ========================================================= */

(function () {
  "use strict";

  // Automatically update footer year.
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // 主页横幅的照片轮播：照片左右滑动切换（backend-01 / 02 / 03 依次出现）。
  // 只在主页（HTML 里带 class="hero-strip--home" 的那个横幅）才会播放，
  // 其它页面顶部是一条纯深蓝横条，不加载这些照片。
  // 换照片 / 增减张数：只改这个数组（按顺序播放，路径相对站点根目录）。
  var BANNER_PHOTOS = [
    "./assets/images/backend-01.jpg",
    "./assets/images/backend-02.jpg",
    "./assets/images/backend-03.jpg"
  ];
  var BANNER_STEP_MS = 8000;   // 每张照片停留多久（毫秒）：8000 = 8 秒
  var BANNER_SLIDE_MS = 1200;  // 滑动切换用多久（毫秒）：1200 = 1.2 秒

  var heroStrip = document.querySelector(".hero-strip--home");
  if (heroStrip && BANNER_PHOTOS.length > 1) {
    var heroTrack = document.createElement("div");
    heroTrack.className = "hero-photos";
    // 末尾再放一张和第一张一样的：滑到它时悄悄把轨道挪回起点，
    // 因为两张图一样，看不出接缝，于是就能无限循环下去。
    BANNER_PHOTOS.concat(BANNER_PHOTOS.slice(0, 1)).forEach(function (src) {
      var slide = document.createElement("div");
      slide.className = "hero-photo";
      slide.style.backgroundImage = 'url("' + src + '")';
      heroTrack.appendChild(slide);
    });
    // 插在 .hero-inner 前面，照片就在文字底下
    heroStrip.insertBefore(heroTrack, heroStrip.firstElementChild);
    // 轨道接管了，关掉 CSS 里那张兜底照片，免得滑动时从底下透出它来
    heroStrip.style.backgroundImage = "none";

    var heroIndex = 0;
    // 系统开了「减少动态效果」就不自动轮播、切换也不滑动，只留圆点能点
    var heroReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var heroMove = function (animate) {
      heroTrack.style.transition = animate
        ? "transform " + BANNER_SLIDE_MS + "ms ease-in-out"
        : "none";
      heroTrack.style.transform = "translateX(" + (-heroIndex * 100) + "%)";
    };
    heroMove(false);

    // 底部小圆点：点第几个就跳到第几张照片。
    // 每组点对应一张真照片，轨道末尾那张复制品（用来无缝绕回）不算一个点，
    // 所以轨道滑到复制品上时，亮点仍然是第 1 个（见 paintDots 里的取余）。
    var heroDots = document.createElement("div");
    heroDots.className = "hero-dots";
    var heroDotList = [];
    var paintDots = function () {
      var active = heroIndex % BANNER_PHOTOS.length;
      heroDotList.forEach(function (dot, i) {
        var on = i === active;
        dot.classList.toggle("is-active", on);
        if (on) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    };

    var heroTimer = null;
    var startHeroTimer = function () {
      if (heroReduced) return; // 关了动效就只靠手点，不自动播
      heroTimer = window.setInterval(function () {
        heroIndex += 1;
        heroMove(true);
        paintDots();
        if (heroIndex === BANNER_PHOTOS.length) {
          // 已经滑到最后那张“复制品”上，等这次滑动结束再瞬间归零
          window.setTimeout(function () {
            heroIndex = 0;
            heroMove(false);
            paintDots();
          }, BANNER_SLIDE_MS);
        }
      }, BANNER_STEP_MS);
    };
    // 手动点过圆点后重新开始数秒，否则刚点完可能马上就又自动跳走了
    var restartHeroTimer = function () {
      window.clearInterval(heroTimer);
      startHeroTimer();
    };

    BANNER_PHOTOS.forEach(function (_src, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero-dot";
      dot.setAttribute("aria-label", "看第 " + (i + 1) + " 张照片");
      dot.addEventListener("click", function () {
        heroIndex = i;
        heroMove(!heroReduced);
        paintDots();
        restartHeroTimer();
      });
      heroDotList.push(dot);
      heroDots.appendChild(dot);
    });
    heroStrip.appendChild(heroDots);

    paintDots();
    startHeroTimer();
  }

  // 主页期刊封面：一行横向滚动。
  //   · 一直在往左慢慢滚，不用管它
  //   · 左右两个圆箭头点一下滑一格（一格 = 一张卡片 + 一个间距）
  //   · 鼠标移到这一行上（也就是停在任何一张期刊上）就暂停，移开继续
  //   · 系统开了「减少动态效果」就不自动滚，只留箭头能点
  // 无缝循环的办法：把轨道里的卡片复制一整份接在后面，
  // 位置绕回起点时两段落内容一模一样，看不出接缝。
  var journalMarquee = document.querySelector(".journal-marquee");
  var journalTrack = document.querySelector(".journal-track");
  if (journalMarquee && journalTrack && journalTrack.children.length) {
    var journalCards = Array.prototype.slice.call(journalTrack.children);

    // 复制一份接在后面。复制品只是给眼睛看的，对屏幕阅读器和 Tab 键藏起来，
    // 否则同一个链接会被念两遍、Tab 要按两轮才走得完。
    journalCards.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      var cloneLink = clone.querySelector("a");
      if (cloneLink) {
        cloneLink.setAttribute("tabindex", "-1");
        cloneLink.setAttribute("aria-hidden", "true");
      }
      journalTrack.appendChild(clone);
    });

    var JOURNAL_SPEED = 0.42;  // 自动滚动速度：每帧推进多少像素（约 25 像素/秒）
    var JOURNAL_EASE = 0.14;   // 画的位置追上目标位置的速度（箭头滑动顺不顺）
    var journalSetWidth = 0;   // 一整份（11 张）的宽度：滚过它就可以绕回起点
    var journalStepWidth = 0;  // 一张卡片 + 一个间距：箭头点一下走多远
    var journalTarget = 0;     // 目标位置（逻辑上的位置）
    var journalShown = 0;      // 当前实际画出来的位置
    var journalHovered = false;
    var journalReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var measureJournal = function () {
      var first = journalTrack.children[0];
      var firstClone = journalTrack.children[journalCards.length];
      if (!first || !firstClone) return;
      // 第 1 张和“复制品里的第 1 张”之间的距离，就是一份的宽度
      journalSetWidth = firstClone.getBoundingClientRect().left
        - first.getBoundingClientRect().left;
      var gap = parseFloat(getComputedStyle(journalTrack).columnGap) || 0;
      journalStepWidth = first.getBoundingClientRect().width + gap;
    };
    measureJournal();

    var wrapJournal = function () {
      if (journalSetWidth <= 0) return;
      // 绕回时 target 和 shown 一起挪，画面才不会突然倒回去
      while (journalTarget >= journalSetWidth) {
        journalTarget -= journalSetWidth;
        journalShown -= journalSetWidth;
      }
      while (journalTarget < 0) {
        journalTarget += journalSetWidth;
        journalShown += journalSetWidth;
      }
    };

    var lastFrame = null;
    var journalTick = function (now) {
      if (lastFrame === null) lastFrame = now;
      // 掉帧或从别的标签页切回来时时间差会很大，掐一下，
      // 否则会一下子窜出去老远
      var dt = Math.min(now - lastFrame, 64);
      lastFrame = now;

      if (!journalHovered && !journalReduced && !document.hidden) {
        journalTarget += JOURNAL_SPEED * dt / 16.7;
      }
      wrapJournal();

      // 画的位置平滑地追上目标位置：自动滚动时几乎重合，
      // 点箭头时就能看出来一段顺滑的滑动
      journalShown += (journalTarget - journalShown) * JOURNAL_EASE;
      if (Math.abs(journalTarget - journalShown) < 0.05) {
        journalShown = journalTarget; // 追到位就别再微调，省得一直重绘
      }
      journalTrack.style.transform = "translateX(" + (-journalShown).toFixed(2) + "px)";

      window.requestAnimationFrame(journalTick);
    };
    window.requestAnimationFrame(journalTick);

    // 鼠标移到这一行上就暂停；键盘 Tab 到某个期刊上也暂停，
    // 不然焦点会跟着卡片跑掉。
    // 监听的是整个 .journal-carousel（含左右箭头）而不是只有取景框：
    // 停在箭头上时也要停，否则一边自动滚一边点，一次会走掉一格多。
    var journalZone = document.querySelector(".journal-carousel") || journalMarquee;
    journalZone.addEventListener("mouseenter", function () { journalHovered = true; });
    journalZone.addEventListener("mouseleave", function () { journalHovered = false; });
    journalZone.addEventListener("focusin", function () { journalHovered = true; });
    journalZone.addEventListener("focusout", function () { journalHovered = false; });

    var stepJournal = function (direction) {
      measureJournal();
      journalTarget += direction * journalStepWidth;
    };
    var journalPrev = document.querySelector("[data-journal-prev]");
    var journalNext = document.querySelector("[data-journal-next]");
    if (journalPrev) {
      journalPrev.addEventListener("click", function () { stepJournal(-1); });
    }
    if (journalNext) {
      journalNext.addEventListener("click", function () { stepJournal(1); });
    }

    // 窗口变宽变窄、或者图片/字体加载完让尺寸变了，都重新量一次
    window.addEventListener("resize", measureJournal);
    window.addEventListener("load", measureJournal);
  }

  // 页面切换动画：整页滑动，规则分三种情况 ——
  //   ① 主页 → 别的页面：上滑（当前页向上滑走，新页面从下方滑上来）
  //   ② 别的页面 → 主页：下滑（当前页向下滑走，新页面从上方滑下来）
  //   ③ 别的页面 → 别的页面：不播动画，直接切过去
  // 当前页这头：点链接时给 <html> 加 leave-up / leave-down，滑完再跳转。
  // 新页面那头：靠 sessionStorage 把 up / down 传过去，由各页 <head> 里那段
  // 小脚本在页面画出来之前给 <html> 加上 enter-up / enter-down（见各 html）。
  // 站外链接、邮件链接、页内锚点都不拦，照常跳转。
  var TRANSITION_KEY = "pageTransition";
  var LEAVE_FALLBACK_MS = 700; // 万一没收到动画结束事件，兜底也跳过去
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 主页是哪一页：认导航里带 data-nav-home 的那个链接的 href
  // （主页现在就叫 index.html，也就是站点入口；这条逻辑只认链接，改名也不怕）
  var homeLink = document.querySelector("[data-nav-home]");
  var homeFile = homeLink ? homeLink.getAttribute("href") || "" : "";
  var currentIsHome = !!document.querySelector(".hero-strip--home");

  // 只看文件名，忽略 "./"、"../" 和 #、? 后面的部分，方便比对
  var toFileName = function (path) {
    var part = String(path || "").split("#")[0].split("?")[0].split("/").pop();
    return part || "index.html";
  };
  homeFile = toFileName(homeFile);
  var currentFile = toFileName(window.location.pathname);

  var remember = function (value) {
    try {
      if (value) {
        window.sessionStorage.setItem(TRANSITION_KEY, value);
      } else {
        window.sessionStorage.removeItem(TRANSITION_KEY);
      }
    } catch (e) { /* 无痕模式等存不了就算了，只是少一次进场动画 */ }
  };

  var leaving = false;

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return; // 按住 Ctrl / 中键等“新窗口打开”的用法不动
    }
    var link = event.target && event.target.closest ? event.target.closest("a") : null;
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    var href = link.getAttribute("href") || "";
    // 只管站内的 .html 页面；"#开头"、外链、mailto: 一律按原样走
    if (!/^[^#:?#]*\.html([?#].*)?$/i.test(href)) return;

    // 点的就是当前这一页：不重新加载（会白闪一下），回到页面顶部就好
    if (toFileName(href) === currentFile) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
      return;
    }

    var destIsHome = toFileName(href) === homeFile;
    var direction = "";
    if (currentIsHome && !destIsHome) {
      direction = "up";
    } else if (!currentIsHome && destIsHome) {
      direction = "down";
    }

    // 情况③（别的页面之间互跳）和「减少动态效果」：不拦，直接跳，不带动画
    if (!direction || reducedMotion) {
      remember("");
      return;
    }

    remember(direction);
    event.preventDefault();
    if (leaving) return;
    leaving = true;
    document.documentElement.classList.add("leave-" + direction);

    var jumped = false;
    var go = function () {
      if (jumped) return;
      jumped = true;
      window.location.href = href;
    };
    (document.querySelector("main") || document.body)
      .addEventListener("animationend", go, { once: true });
    window.setTimeout(go, LEAVE_FALLBACK_MS);
  });

  // 论文分页：每页最多 PER_PAGE 篇，其余用页面底部的“下一页”翻页。
  // 全部论文仍然写在 HTML 里，只是用 is-hidden 类控制显示哪一页。
  var pubList = document.querySelector(".publication-list");
  var pager = document.querySelector(".pagination");
  if (pubList && pager) {
    var PER_PAGE = 10; // 每页篇数：想一页放更多/更少就改这个数
    var pubItems = Array.prototype.slice.call(
      pubList.querySelectorAll(".publication-item")
    );
    // 年份小标题：每篇归到它前面最近的那个 <h2 class="publication-year"> 下。
    // 翻页时如果这一年一篇都没露脸，标题也跟着藏起来，
    // 否则第 2 页会孤零零挂着「2022」下面却是空的。
    var yearHeadings = Array.prototype.slice.call(
      pubList.querySelectorAll(".publication-year")
    );
    var itemYear = pubItems.map(function (item) {
      var node = item.previousElementSibling;
      while (node && !node.classList.contains("publication-year")) {
        node = node.previousElementSibling;
      }
      return node; // 万一没找到就是 null，下面会跳过
    });
    var prevBtn = pager.querySelector("[data-page-prev]");
    var nextBtn = pager.querySelector("[data-page-next]");
    var statusEl = pager.querySelector("[data-page-status]");
    var pageInput = pager.querySelector("[data-page-input]");
    var goBtn = pager.querySelector("[data-page-go]");
    var totalPages = Math.ceil(pubItems.length / PER_PAGE);
    var currentPage = 1;

    var renderPage = function () {
      var start = (currentPage - 1) * PER_PAGE;
      var end = start + PER_PAGE;

      // 先假设所有年份都藏起来，再看这一页上到底有哪几年，
      // 有论文露出来的年份才把标题放回去。
      yearHeadings.forEach(function (heading) {
        heading.classList.add("is-hidden");
      });

      pubItems.forEach(function (item, index) {
        var onThisPage = index >= start && index < end;
        item.classList.toggle("is-hidden", !onThisPage);
        if (onThisPage && itemYear[index]) {
          itemYear[index].classList.remove("is-hidden");
        }
      });

      statusEl.textContent = "第 " + currentPage + " / " + totalPages + " 页";
      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = currentPage >= totalPages;

      // 跳转输入框跟随当前页，并限制不能超过总页数
      if (pageInput) {
        pageInput.max = totalPages;
        pageInput.value = currentPage;
      }
    };

    var goToPage = function (page) {
      currentPage = Math.min(Math.max(page, 1), totalPages);
      renderPage();
      // 翻页后回到列表顶部，方便从头看
      pubList.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    prevBtn.addEventListener("click", function () {
      goToPage(currentPage - 1);
    });

    nextBtn.addEventListener("click", function () {
      goToPage(currentPage + 1);
    });

    // “跳转到 __ 页”：点“跳转”按钮或按回车都可以
    var jumpToInput = function () {
      var target = parseInt(pageInput.value, 10);
      if (isNaN(target)) {
        renderPage(); // 输入不是数字时还原成当前页
        return;
      }
      goToPage(target);
    };

    if (pageInput && goBtn) {
      goBtn.addEventListener("click", jumpToInput);
      pageInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          jumpToInput();
        }
      });
    }

    // 不足一页时不显示分页条
    if (totalPages > 1) {
      pager.hidden = false;
    }
    renderPage();
  }

  // 点击图片看大图（弹窗）。
  // 页面上没有弹窗结构时自动建一个，所以任何页面只要把图片套进
  // <button class="zoom-button" data-enlarge> 就能放大查看。
  var modal = document.getElementById("imageModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "imageModal";
    modal.className = "image-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-label", "图片放大预览");
    modal.innerHTML =
      '<button class="image-modal-close" type="button" aria-label="关闭">&times;</button>' +
      '<img class="image-modal-content" src="" alt="">';
    document.body.appendChild(modal);
  }

  var modalImage = modal.querySelector(".image-modal-content");
  var closeButton = modal.querySelector(".image-modal-close");

  function openModal(src, alt) {
    modalImage.src = src;
    modalImage.alt = alt || "放大图片";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modalImage.src = "";
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-enlarge]").forEach(function (button) {
    button.addEventListener("click", function () {
      var image = button.querySelector("img");
      if (image) openModal(image.src, image.alt);
    });
  });

  if (closeButton) closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });
})();
