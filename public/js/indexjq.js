$(function(){
    // Img Slide Function
    setInterval(
        function(){
            $("#mainSlide").animate({ 
                left:"-100%"
            }, 1000, function(){
            img = $("#mainSlide>div").eq(0).detach();
            $("#mainSlide").css("left", "0px");
            $("#mainSlide").append(img);
        });
    }, 4000);

    // Change CSS width 2nd Page
    $(window).scroll(function(){
        let windowWidth = $(window).width();
        if($(window).scrollTop() > 500 && windowWidth > 1280) {
            $("header").css("background-color", "#FFFFFF");
            $("header").css("border-bottom", "2px solid lightgray");
            $(".top_menu_wrap div").css("border-bottom", "1px solid #000000");
            $(".top_menu_wrap>div>input").css("background-color", "transparent");
            $(".top_menu_wrap>div>input::placeholder").css("color", "rgba(0, 0, 0, 1)"); // 적용안됨
            $(".topsearchBtn i").css("color", "var(--jqtext-color)");
            $(".top_menu_wrap>ul>li:not(:last-child)").css("border-right", "1px solid black");
            $(".top_menu_wrap>ul>li>a").css("color", "var(--jqtext-color)");
            $(".header_wrap>a>span").css("color", "var(--jqtext-color)");
            $(".submenu > li > a").css("color", "var(--submenu-text-color)");
            $(".header_wrap>ul>li>a").css("color", "var(--jqtext-color)");
            $("#menuicon").css("color", "var(--jqtext-color)");

        }else if(windowWidth > 1280) {
            $("header").css("background-color", "transparent");
            $("header").css("border-bottom", "none");
            $(".top_menu_wrap div").css("border-bottom", "1px solid #FFFFFF");
            $(".top_menu_wrap>div>input").css("background-color", "transparent");
            $(".top_menu_wrap>div>input::placeholder").css("color", "rgba(255, 255, 255, 0.7)");
            $(".topsearchBtn i").css("color", "var(--text-color)");
            $(".top_menu_wrap>ul>li:not(:last-child)").css("border-right", "1px solid lightgray");
            $(".top_menu_wrap>ul>li>a").css("color", "var(--text-color)");
            $(".header_wrap>a>span").css("color", "var(--text-color)");
            $(".submenu > li > a").css("color", "var(--submenu-text-color)");
            $(".header_wrap>ul>li>a").css("color", "var(--text-color)");
            $("#menuicon").css("color", "var(--text-color)");
        }
    });

    let once = null;

    $(".page").on("mousewheel DOMMouseScroll", function(e){
        if(once) clearTimeout(once);
        once = setTimeout(() => {
            updown(e, this);
        }, 150);
    });

    function updown(e, page) {
        let E = e.originalEvent;
        let delta = 0;

        if(E.detail) { // 디테일 -> detail : 파이어폭스만 가지고 있다.
            delta = E.detail * -40; // 마우스를 내리면 +3이 나온다. 이를 위하여 -40을 곱한다.
            // $("#wrap div").last().text(delta+"파폭");

        }else { // E.detail의 값이 없으면 익스플로러, 크롬 -> 익스, 크롬에서 작동
            delta = E.wheelDelta; // 마우스를 내리면 -120이 나온다.

            if(window.opera) { // opera 브라우저는 똑같이 120이 나오지만, 크롬, 익스와 음양이 반대로 나온다.
                dalta = -delta;
            }
        }

        if(delta > 0) { // delta > 0 -> 마우스 휠을 올렸을 때 / delta < 0 -> 마우스 휠을 내렸을 때
            // console.log('up');
            // console.dir(this);
            // console.dir(page);
            // console.log(this.previousElementSibling.offsetTop);
            // console.log(page.previousElementSibling.offsetTop);
            // window.scrollTo({left: 0, top: this.previousElementSibling.offsetTop, behavior: "smooth"});
            if((page.previousElementSibling != null)&&(page.clientWidth >= 1400)) {
                $('html, body').stop().animate({scrollTop: page.previousElementSibling.offsetTop}, 300);
            }
            // if($(this).index() > 0)
                //$(this).stop().slideUp();
        }else {
            // console.log('down');
            //$(this).next().stop().slideDown();
            // console.dir(page);
            if((page.nextElementSibling != null)&&(page.clientWidth >= 1400)) {
                $('html, body').stop().animate({scrollTop: page.nextElementSibling.offsetTop}, 300);
            }
        }
    }

});

// Header 상단바 JQuery
$(".menubar>li").mouseover(function(){
    let screenWidth = $(window).width();
    if(screenWidth >= 1400) {
        // $(".submenu").css("height", "181px");
        $(".submenu").stop().slideDown();
        $(this).find("ul").css("background-color", "var(--submenu-bgcolor)");
        $(".submenu_back").stop().slideDown();
    }else {
        // $(".submenu").css("height", "inherit");
        $(this).children(".submenu").stop().slideDown();
        $(this).find("ul").css("background-color", "var(--submenu-bgcolor)");
    }
});
$(".menubar>li").mouseleave(function(){
    let screenWidth = $(window).width();
    if(screenWidth >= 1400) {
        $(".submenu").stop().slideUp();
        $(this).find("ul").css("background-color", "#FFFFFF");
        $(".submenu_back").stop().slideUp();
    }else {
        $(this).children(".submenu").stop().slideUp();
        $(this).find("ul").css("background-color", "#FFFFFF");
    }
});