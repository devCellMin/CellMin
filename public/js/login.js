window.onload = function() {
    if(msg.value != "") {
        alert(msg.value);
    }

    btnSubmit.onclick = function() {
        if(userID.value.length == 0) {
            alert('아이디를 입력하세요.');
            return;
        } else if(userPWD.value.length == 0) {
            alert('비밀번호를 입력하세요.');
            return;
        }
        login_box.submit();
    };

    window.onkeydown = (e)=> {
        if(e.key == 'Enter') {
            if(userID.value.length == 0) {
                alert('아이디를 입력하세요.');
                return;
            } else if(userPWD.value.length == 0) {
                alert('비밀번호를 입력하세요.');
                return;
            }
            login_box.submit();
        }
    }

};