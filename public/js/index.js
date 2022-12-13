window.onload = function() {
    const menubar = document.querySelector('.menubar');
    const memberMenu = document.querySelector('.submenu_member');

    menuicon.addEventListener('click', ()=> {
        menubar.classList.toggle('active');
        memberMenu.classList.toggle('active');
    });



};