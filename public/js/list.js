window.onload = function() {
    const menubar = document.querySelector('.menubar');
    const memberMenu = document.querySelector('.submenu_member');

    menuicon.addEventListener('click', ()=> {
        menubar.classList.toggle('active');
        memberMenu.classList.toggle('active');
    })

    selPageSize.value = items.value;
    btnsizeChange.onclick = function() {
        let items = selPageSize.value;
        window.location.href=`/board/list/${boardName.value}/${items}`;
    }

    if(authority.value == 0) {
        alert('권한이 없습니다.');
    }

    // Search Function
    btn_search.onclick = ()=> {
        alert('개발 준비중인 기능입니다.');
        return;
    }

    if(content_user.value) {
        btnTMLogin.innerText = "로그아웃";
        btnTMSignUp.innerText = "회원정보변경";
        btnTMFindInfo.innerText = `${content_user.value}님 반갑습니다.`;
        btnLogin.innerText = "로그아웃";
        btnSignUp.innerText = "회원정보변경";
        btnFindInfo.innerText = `${content_user.value}님 반갑습니다.`;

    }else {
        btnTMLogin.innerText = "로그인";
        btnTMSignUp.innerText = "회원가입";
        btnTMFindInfo.innerText = "아이디 / 비밀번호 찾기";
        btnLogin.innerText = "로그인";
        btnSignUp.innerText = "회원가입";
        btnFindInfo.innerText = "아이디 / 비밀번호 찾기";
    }
    
    btnTMLogin.onclick = ()=> {
        if(btnTMLogin.innerText == "로그인") {
            window.location.href = "/login";
        }else {
            window.location.href = "/logout";
        }
    }

    btnTMSignUp.onclick = ()=> {
        if(btnTMSignUp.innerText == "회원가입") {
            window.location.href = "/signup";
        }else {
            window.location.href = `/modifyInfo/${content_user.value}`;
        }
    }
    
    btnTMFindInfo.onclick = ()=> {
        if(btnTMFindInfo.innerText == "아이디 / 비밀번호 찾기") {
            window.location.href = "/findinfo"
        }
    }

    btnLogin.onclick = ()=> {
        if(btnLogin.innerText == "로그인") {
            window.location.href = "/login";
        }else {
            window.location.href = "/logout";
        }
    }

    btnSignUp.onclick = ()=> {
        if(btnSignUp.innerText == "회원가입") {
            window.location.href = "/signup";
        }else {
            window.location.href = `/modifyInfo/${content_user.value}`;
        }
    }
    
    btnFindInfo.onclick = ()=> {
        if(btnFindInfo.innerText == "아이디 / 비밀번호 찾기") {
            window.location.href = "/findinfo"
        }
    }
};