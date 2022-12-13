// Header 상단바 JQuery
$(".menubar>li").mouseover(function(){
    let screenWidth = $(window).width();
    if(screenWidth >= 1400) {
        $(".submenu").stop().slideDown();
        $(".submenu").css("height", "181px");
        $(this).find("ul").css("background-color", "var(--submenu-bgcolor)");
        $(".submenu_back").stop().slideDown();
    }else {
        $(".submenu").css("height", "inherit");
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