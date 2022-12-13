window.onload = function() {
    userName.value = userEmail.value = userID.value = p_userEmail.value = "";

    btnfindID.onclick = function() {
        if(!userName.value.trim()){
            alert('이름을 입력하여주세요.');
            return;
        }else if(!userEmail.value.trim()) {
            alert('이메일을 입력하여주세요.');
            return;
        }
        findID_box.submit();
    }

    btnfindPWD.onclick = function() {
        if(!userID.value.trim()) {
            alert('아이디를 입력하세요.');
            return;
        }else if(!p_userEmail.value.trim()) {
            alert('이메일을 입력하여 주세요.');
            return;
        }
        findPWD_box.submit();
    }
    
}