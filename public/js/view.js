window.onload = function() {
    const menubar = document.querySelector('.menubar');
    const memberMenu = document.querySelector('.submenu_member');

    menuicon.addEventListener('click', ()=> {
        menubar.classList.toggle('active');
        memberMenu.classList.toggle('active');
    })

    // if(boardName.value == "notice" || boardName.value == "portfolio" || boardName.value == "itdev" || boardName.value == "sourcecode") {
    //     if(!(isAuther.value == "ADMIN")) {
    //         btn_wrap.style.display = "none";
    //     }
    // }else {
    //     if(!(isAuther.value == content_user.value)) {
    //         btn_wrap.style.display = "none";
    //     }
    // }

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
        console.log(btnTMLogin.innerText);
        if(btnTMLogin.innerText == "로그인") {
            window.location.href = "/login";
        }else {
            if(confirm('로그아웃 하시겠습니까?')) {
                window.location.href = "/logout";
            }
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
            if(confirm('로그아웃 하시겠습니까?')) {
                window.location.href = "/logout";
            }
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

    btnDelete.onclick = ()=> {
        if(confirm('게시글을 삭제하시겠습니까?')) {
            window.location.href = `/board/delete/${boardName.value}/${cont_no.value}`;
        }
    }

    btnWrite.onclick = ()=> {
        window.location.href = `/board/modify/${boardName.value}/${cont_no.value}`;
    }
};