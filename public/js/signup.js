let pwdcheck_result = false;


window.onload = function() {
    // btn Sign Up
    btnSignUp.onclick = function() {
        if(userID.value.length == 0) {
            alert("아이디를 입력하세요.");
            return;
        }else if(userName.value.length == 0){
            alert("이름을 입력하세요.");
            return;
        }else if(userPWD.value.length == 0) {
            alert("비밀번호를 입력하세요.");
            return;
        }else if(!pwdcheck_result) {
            alert("비밀번호와 확인란이 불일치 합니다.");
            return;
        } else if (userEmail.value.length == 0) {
            alert("이메일을 입력하세요.");
            return;
        } else if (userID.value.length > 15) {
            alert('아이디는 15자 미만으로 설정가능 합니다.');
            return;
        } else if (userPWD.value.length > 15) {
            alert('비밀번호는 15자 미만으로 설정가능 합니다.');
            return;
        } else if(window.confirm("회원가입 하시겠습니까?")) {
            signUp_box.submit();
        }
    }
};




// PWD Check
$(function() {
    let pwd, pwdCheck;

    $("#userPWD").keyup(()=>{
        pwd = $("#userPWD").val();
        pwdCheck = $("#pwdCheck").val();

        if(pwd == pwdCheck) {
            $("#pwdCheck-index").text("비밀번호 일치");
            $("#pwdCheck-index").css("color", "blue");
            pwdcheck_result = true;
        }else {
            $("#pwdCheck-index").text("비밀번호 불일치");
            $("#pwdCheck-index").css("color", "red");
            pwdcheck_result = false;
        }
    });

    $("#pwdCheck").keyup(()=>{
        pwd = $("#userPWD").val();
        pwdCheck = $("#pwdCheck").val();

        if(pwd == pwdCheck) {
            $("#pwdCheck-index").text("비밀번호 일치");
            $("#pwdCheck-index").css("color", "blue");
            pwdcheck_result = true;
        }else {
            $("#pwdCheck-index").text("비밀번호 불일치");
            $("#pwdCheck-index").css("color", "red");
            pwdcheck_result = false;
        }
    });
});