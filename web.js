// add Modules
const getdate = require("./route/getDate");
const fs = require('node:fs');
const ejs = require("ejs"); // npm install ejs
const mysql = require("mysql"); // npm install mysql
const express = require("express"); // npm install express@4
const bodyParser = require("body-parser"); // npm install body-parser
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const bcrypt = require('bcrypt');
const flash = require("connect-flash");

// DB Connection
const client = mysql.createConnection({
    user: 'root',
    password: '!@#alstp9753',
    database: 'db_cellmin'
});
const PORT = 8888;

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("views"));
app.use("/public", express.static(__dirname+"/public"));

app.use(bodyParser.json());
app.use(expressSession({
    secret : 'secretCode', 
    resave : true, 
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Set Tables and Pages Object
const dbList = {
    membersTB : "MEMBERS_TB",
    noticeTB : "NOTICE_TB",
    freeBoardTB : "FREE_BOARD_TB",
    galleryTB : "GALLERY_TB",
    youTubeTB : "YOU_TUBE_TB",
    portfolioTB : "PORTFOLIO_TB",
    itDevTB : "IT_DEV_TB",
    sourceTB : "SOURCE_CODE_TB"
}

const pageEncoding = "UTF-8";


// Page Objects
const pageIndex = {
    routePath : "/",
    pageHTML : "index.ejs",
    portfolio : function() {
        return `Select * From ${dbList.portfolioTB} Order by PORTFOLIO_NO_PK DESC Limit 0, 5`;
    },
    sourcecode : function() {
        return `Select * From ${dbList.sourceTB} Order by SOURCE_CODE_NO_PK DESC Limit 0, 5`;
    },
    itdev : function() {
        return `Select * From ${dbList.itDevTB} Order by IT_DEV_NO_PK DESC Limit 0, 13`;
    },
    notice : function() {
        return `Select * From ${dbList.noticeTB} Order by NOTICE_NO_PK DESC Limit 0, 12`;
    },
    freeBoard : function() {
        return `Select * From ${dbList.freeBoardTB} Order by FREE_BD_NO_PK DESC Limit 0, 12`;
    }

}


// Main Index
app.get(pageIndex.routePath, function (req, res) {
    let portfolio, sourcecode, itdev, notice, freeBoard;
    client.query(pageIndex.portfolio(), function(portfolioerr, portfolio_result) {
        portfolioerr ? console.log("Index Portfolio Error")
        : (()=> {
            client.query(pageIndex.sourcecode(), function(sourceErr, sourceCode_result) {
                sourceErr ? console.log("Index SourceCode Error")
                : (()=>{
                    client.query(pageIndex.itdev(), function(itdevErr, itdev_result) {
                        itdevErr ? console.log("Index ItDev Error")
                        : (()=> {
                            client.query(pageIndex.notice(), function(noticeErr, notice_result) {
                                noticeErr ? console.log("Index Notice Error")
                                : (()=> {
                                    client.query(pageIndex.freeBoard(), function(freeBoardErr, freeBoard_result) {
                                        freeBoardErr ? console.log("Index FreeBoard Error")
                                        : (()=> {
                                            res.render(pageIndex.pageHTML, { 
                                                portfolio : portfolio_result, 
                                                sourcecode : sourceCode_result, 
                                                itdev : itdev_result, 
                                                notice : notice_result, 
                                                freeBoard : freeBoard_result,
                                                SD : sessionData
                                            });
                                        })();
                                    });
                                })();
                            });
                        })();
                    });
                })();
            });
        })();
    });
});


// Members Part
const pageMembers = {
    // Table Name
    TB_Name : dbList.membersTB,
    TB_PK : "MEMBER_NO_PK",

    // Route Path
    login_RoutePath : "/login",
    signup_RoutePath : "/signup",
    findinfo_RoutePath : "/findinfo",
    modifyInfo_RoutePath : "/modifyInfo/:id",
    logout_RoutePath : "/logout",

    // HTML
    login_HTML : "views/members/login.html",
    signup_HTML : "views/members/signup.html",
    findinfo_HTML : "views/members/findinfo.html",
    modifyInfo_HTML : "views/members/modifyInfo.html",
    logout_HTML : "views/members/logout.html",

    // Redirect
    redirect_RoutePath : ()=> {
        return `/`;
    }
}

const Members_Query = {
    Login: function(id) {
        return `Select MEMBER_ID, MEMBER_PWD, MEMBER_KIND From ${dbList.membersTB}
                Where MEMBER_ID = '${id}'`;
    },
    isNew : function(id) {
        return `Select Count(*) as cnt From ${dbList.membersTB} Where MEMBER_ID = '${id}'`;
    },
    SignUp: function(userID, userName, userPWD, userEmail, userkind) {
        return `Insert Into ${dbList.membersTB} 
                (MEMBER_ID, MEMBER_NAME, MEMBER_PWD, MEMBER_EMAIL, MEMBER_KIND)
                Values('${userID}', '${userName}', '${userPWD}', '${userEmail}', '${userkind}')`;
    },
    findID: function(userName, userEmail) {
        return `Select MEMBER_ID as id From ${dbList.membersTB} 
                Where MEMBER_NAME = '${userName}' and MEMBER_EMAIL = '${userEmail}' and MEMBER_KIND = 'USER'`;
    },
    findPWD: function(userID, userEmail) {
        return `Select * From ${dbList.membersTB} 
                Where MEMBER_ID = '${userID}' and MEMBER_EMAIL = '${userEmail}' and MEMBER_KIND = 'USER'`;
    },
    Modify : function(id) {
        return `Select MEMBER_ID as id, MEMBER_NAME as name, MEMBER_EMAIL as email
                From ${dbList.membersTB} Where MEMBER_ID = '${id}'`;
    },
    changeInfo: function(userID, userName, userPWD, userEmail) {
        return `Update ${dbList.membersTB} Set MEMBER_PWD = '${userPWD}'
                Where MEMBER_ID = '${userID}' and MEMBER_NAME = '${userName}' and MEMBER_EMAIL = '${userEmail}'`;
    }
}

// Login
app.get(pageMembers.login_RoutePath, function(req, res) {
    fs.readFile(pageMembers.login_HTML, pageEncoding, function(err, data) {
        let msg;
        let error = req.flash('error');
        if(error) {
            msg = error;
        }
        err ? console.log(`Read HTML Error ${err}`)
        : (()=> {
            res.send(ejs.render(data.toString(), {msg : msg}));
        })();
    });
});

app.post(pageMembers.login_RoutePath, passport.authenticate('local', { 
        successRedirect : pageIndex.routePath,
        failureRedirect : pageMembers.login_RoutePath,
        failureFlash : true
    })
);

passport.use(new localStrategy({
    usernameField : 'userID',
    passwordField : 'userPWD',
    session : true, // 세션에 저장 여부
    passReqToCallback : true,
}, (req, userID, userPWD, done) => {
    client.query(Members_Query.Login(userID), function (err, result) {
        if(err) {return done(err);}
        else {
            if(result.length < 1) {
                return done(null, false, {message : '존재하지 않는 아이디입니다.'});
            } else{
                (()=> {
                    bcrypt.compare(userPWD, result[0].MEMBER_PWD, (error, same) => {
                        const data = {
                            id : result[0].MEMBER_ID,
                            kind : result[0].MEMBER_KIND
                        };
                        if(error) {return done(null, false, {message : '에러가 발생하였습니다.'});}
                        if(same) {return done(null, data);}
                        else if(!same) {return done(null, false, {message : '비밀번호를 확인해 주세요.'});}
                    })
                })();
            }
        }
    });
}));

let sessionData = {id : "", kind : ""};
// 세션에 id 저장
passport.serializeUser((user, done) => {
    // console.log("serializeUser() 호출");
    // console.log(user);
    sessionData.id = user.id;
    sessionData.kind = user.kind;
    done(null, user);
});
// 세션에 저장된 id를 DB에서 검색
passport.deserializeUser((user, done) => {
    // console.log("deserializeUser() 호출");
    // console.log(user);
    sessionData.id = user.id;
    sessionData.kind = user.kind;
    done(null, user);
});

//로그인 유무 체크
function chk_Login(req, res, next){
    console.log(req.user);
    const chk_board = {
        notice: (req, res, next)=> {
            if(req.user) {
                (req.user.kind == "ADMIN") ? next()
                : res.redirect("/board/list/notice/10?authority=0");
            }else {
                res.redirect('/login')
            }
        },
        free: (req, res, next)=> {
            (req.user) ? next() : res.redirect('/login');
        },
        gallery: (req, res, next)=> {
            (req.user) ? next() : res.redirect('/login');
        },
        youTubeClip : (req, res, next)=> {
            (req.user) ? next() : res.redirect('/login');
        },
        portfolio : (req, res, next)=> {
            if(req.user) {
                (req.user.kind == "ADMIN") ? next()
                : res.redirect("/board/list/portfolio/10?authority=0");
            }else {
                res.redirect('/login')
            }
        },
        itdev : (req, res, next)=> {
            if(req.user) {
                (req.user.kind == "ADMIN") ? next()
                : res.redirect("/board/list/itdev/10?authority=0");
            }else {
                res.redirect('/login')
            }
        },
        sourcecode : (req, res, next)=> {
            if(req.user) {
                (req.user.kind == "ADMIN") ? next()
                : res.redirect("/board/list/sourcecode/10?authority=0");
            }else {
                res.redirect('/login')
            }
        }
    };

    const boardKind = req.path.split('/')[3];
    chk_board[`${boardKind}`](req, res, next);
};

// Log out
app.get(pageMembers.logout_RoutePath, function(req, res) {
    req.session.destroy(function(){
        sessionData.id = "";
        sessionData.kind = "";
        res.cookie('connect.sid','',{maxAge:0}) 
        res.redirect('/');
    });
});

// SignUp
app.get(pageMembers.signup_RoutePath, function(req, res) {
    fs.readFile(pageMembers.signup_HTML, pageEncoding, function(err, data) {
        err ? console.log(`Read HTML Error ${err}`)
        : (()=> {
            res.send(ejs.render(data.toString()));
        })();
    });
});

app.post(pageMembers.signup_RoutePath, function (req, res) {
    const { userID, userName, userPWD, userEmail } = req.body;
    client.query(Members_Query.isNew(userID), function(err, newtf) {
        err ? console.log(err)
        : (newtf[0].cnt != 0) ? (()=> {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write("<script>alert('중복된 아이디가 존재합니다.')</script>");
            res.write("<script>window.history.back()</script>");
        })()
        : (()=> {
            const encryptedPassword = bcrypt.hashSync(userPWD, 10);
            client.query(Members_Query.SignUp(userID, userName, encryptedPassword, userEmail, 'USER'), function (err) {
                err? console.log(`Insert Contents Error ${err}`) 
                : res.redirect(pageMembers.redirect_RoutePath());
            });
        })()

    });
});



// findinfo
app.get(pageMembers.findinfo_RoutePath, function(req, res) {
    fs.readFile(pageMembers.findinfo_HTML, pageEncoding, function(err, data) {
        err ? console.log(`Read HTML Error ${err}`)
        : (()=> {
            res.send(ejs.render(data.toString()));
        })();
    });
});

app.post(pageMembers.findinfo_RoutePath, function (req, res) {
    const { userName, userEmail, userID, p_userEmail } = req.body;

    if(userName) {
        client.query(Members_Query.findID(userName, userEmail), function (err, searchedID) {
            err? console.log(`Insert Contents Error ${err}`) 
            : (()=> {
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.write(`<script>alert("귀하의 아이디는 ${searchedID[0].id}입니다.")</script>`);
                res.write("<script>window.location.href='/login'</script>");
            })();
        });
    }else {
        client.query(Members_Query.findPWD(userID, p_userEmail), function (err, searchedInfo) {
            if(err) {console.log(err);}
            else {
                (searchedInfo.length < 1)
                ? (()=> {
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                    res.write(`<script>alert("입력하신 정보와 일치하는 회원이 존재하지 않습니다..")</script>`);
                    res.write("<script>window.history.back()</script>");
                })()
                : res.redirect(`/modifyInfo/${searchedInfo[0].MEMBER_ID}`);
            }
        });
    }
});

app.get(pageMembers.modifyInfo_RoutePath, function(req, res) {
    fs.readFile(pageMembers.modifyInfo_HTML, pageEncoding, function(err, data) {
        err ? console.log(`Read HTML Error ${err}`)
        : (()=> {
            client.query(Members_Query.Modify(req.params.id), function(error, result) {
                res.send(ejs.render(data.toString(), {result : result[0]}));
            })
        })();
    });
});

app.post(pageMembers.modifyInfo_RoutePath, function (req, res) {
    const { userID, userName, userPWD, userEmail } = req.body;
    client.query(Members_Query.isNew(userID), function(err, newtf) {
        err ? console.log(err)
        : (()=> {
            const encryptedPassword = bcrypt.hashSync(userPWD, 10);
            client.query(Members_Query.changeInfo(userID, userName, encryptedPassword, userEmail), function (err) {
                err? console.log(`Update Information Error ${err}`) 
                : res.redirect(pageMembers.redirect_RoutePath());
            });
        })()
    });
});




// Notice Board
const pageNotice = {
    // Page Name
    pageName: "notice",

    // Table Name
    TB_Name : dbList.noticeTB,
    TB_PK : "NOTICE_NO_PK",

    // Route Path
    list_RoutePath : "/board/list/notice/:items",
    write_RoutePath : "/board/write/notice/:items",
    view_RoutePath : "/board/view/notice/:notice_no",
    modify_RoutePath : "/board/modify/notice/:notice_no",
    delete_RoutePath : "/board/delete/notice/:notice_no",

    // HTML
    list_HTML : "list/noticeBoard.ejs",
    write_HTML : "write/noticeBoard.ejs",
    view_HTML : "view/noticeBoard.ejs",
    modify_HTML : "modify/noticeBoard.ejs",

    // Redirect
    redirect_RoutePath : (items)=> {
        return `/board/list/notice/${items}`;
    }
}

const NoticeBoard_Query = {
    Count : function() {
        return `Select count(*) as cnt from ${pageNotice.TB_Name}`;
    },
    List : function(start, items) {
        return `Select * from ${pageNotice.TB_Name} 
                Order by ${pageNotice.TB_PK} DESC Limit ${start}, ${items}`;
    },
    Write : function(kind, title, txt, date, view) {
        return `Insert into ${pageNotice.TB_Name} 
                (NOTICE_KIND, NOTICE_TITLE, NOTICE_TEXT, NOTICE_DATE, NOTICE_VIEW_CNT) 
                Values ('${kind}', '${title}', '${txt.replace(/'/g, "\\\'")}', '${date}', ${view})`;
    },
    View : function(notice_no) {
        return `Select * From ${pageNotice.TB_Name} 
                Where ${pageNotice.TB_PK} = ${notice_no}`;
    },
    ViewCnt : function(notice_no) {
        return `Update ${pageNotice.TB_Name} Set NOTICE_VIEW_CNT = NOTICE_VIEW_CNT + 1 
                Where ${pageNotice.TB_PK} = ${notice_no}`;
    },
    Modify : function(kind, title, txt, notice_no) {
        return `Update ${pageNotice.TB_Name} Set NOTICE_KIND = '${kind}', 
                NOTICE_TITLE = '${title}', NOTICE_TEXT = '${txt}'
                Where ${pageNotice.TB_PK} = ${notice_no}`;
    },
    Delete : function(notice_no) {
        return `Delete From ${pageNotice.TB_Name} Where ${pageNotice.TB_PK} = ${notice_no}`;
    }
}

app.get(pageNotice.list_RoutePath, function (req, res) {
    let pagedata;
    client.query(NoticeBoard_Query.Count(), function (cnt_error, settings) {
        cnt_error ? console.log(`Setting Data Error ${cnt_error}`) 
        : (()=> {
            pagedata = {
                "name" : pageNotice.pageName,
                "items": +req.params.items,
                "cpage": req.query.page ?? 1,
                "tpage": (settings[0].cnt % req.params.items == 0) ? parseInt(settings[0].cnt / req.params.items) : parseInt(settings[0].cnt / req.params.items)+1,
                "total": settings[0].cnt,
                "start": (Number(req.query.page ?? 1) - 1) * req.params.items,
                "authority" : req.query.authority ?? 1
            };
        })();

        client.query(NoticeBoard_Query.List(pagedata["start"], pagedata["items"]), function (list_err, list_result) {
            list_err ? console.log(`Getting Data Error ${list_err}`) 
            : (()=> {
                res.render(pageNotice.list_HTML, { results: {
                    result : list_result,
                    pagedata: pagedata
                }, SD : sessionData });
            })();
        });
    });
});

// Write Notice Board Contents
app.get(pageNotice.write_RoutePath, chk_Login, function (req, res) {
    res.render(pageNotice.write_HTML, {SD : sessionData, name: pageNotice.pageName});
});

app.post(pageNotice.write_RoutePath, function (req, res) {
    const { content_tit, content_kind, content_txt } = req.body;
    const cont_date = getdate.date2String(new Date(), "-");
    client.query(NoticeBoard_Query.Write(content_kind, content_tit, content_txt, cont_date, 0), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pageNotice.redirect_RoutePath(req.params.items));
    });
});

// View Notice Board Contents
app.get(pageNotice.view_RoutePath, function (req, res) {
    client.query(NoticeBoard_Query.View(req.params.notice_no), function (view_data_err, result) {
        view_data_err ? console.log(`Getting Notice Content Data Error ${view_data_err}`) 
        : (()=> {
            client.query(NoticeBoard_Query.ViewCnt(req.params.notice_no), (view_cnt_err, updateResult)=>{
                if(view_cnt_err) console.log(`Increase View Count Error ${view_cnt_err}`);
            }); 
            res.render(pageNotice.view_HTML, {
                result: result[0], 
                name: pageNotice.pageName,
                SD : sessionData
            });
        })();
    });
});

// Modify Notice Board Contents
app.get(pageNotice.modify_RoutePath, chk_Login, function (req, res) {
    client.query(NoticeBoard_Query.View(req.params.notice_no), function(err, result) {
        res.render(pageNotice.modify_HTML, {
            result : result[0], 
            name: pageNotice.pageName, 
            notice_no: req.params.notice_no,
            SD : sessionData
        });
    });
});

app.post(pageNotice.modify_RoutePath, function (req, res) {
    const { content_tit, content_kind, content_txt, notice_no } = req.body;
    client.query(NoticeBoard_Query.Modify(content_kind, content_tit, content_txt, notice_no), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pageNotice.redirect_RoutePath(10));
    });
});

app.get(pageNotice.delete_RoutePath, function(req, res) {
    client.query(NoticeBoard_Query.Delete(req.params.notice_no), function(err) {
        err ? console.log('Delete Error'+err)
        : (()=> {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write("<script>alert('삭제 완료되었습니다.')</script>");
            res.write(`<script>location.href = '${pageNotice.redirect_RoutePath(10)}'</script>`);
        })();
    });
});


// Free Board
const pageFreeBoard = {
    // Page Name
    pageName: "free",

    // Table Name
    TB_Name : dbList.freeBoardTB,
    TB_PK : "FREE_BD_NO_PK",

    // Route Path
    list_RoutePath : "/board/list/free/:items",
    write_RoutePath : "/board/write/free/:items",
    view_RoutePath : "/board/view/free/:free_no",
    modify_RoutePath : "/board/modify/free/:free_no",

    // HTML
    list_HTML : "list/freeBoard.ejs",
    write_HTML : "write/freeBoard.ejs",
    view_HTML : "view/freeBoard.ejs",
    modify_HTML : "modify/freeBoard.ejs",

    // Redirect
    redirect_RoutePath : (items)=> {
        return `/board/list/free/${items}`;
    }
}

const FreeBoard_Query = {
    Count : function() {
        return `Select count(*) as cnt from ${pageFreeBoard.TB_Name}`;
    },
    List : function(start, items) {
        return `Select * from ${pageFreeBoard.TB_Name} 
                Order by ${pageFreeBoard.TB_PK} DESC Limit ${start}, ${items}`;
    },
    Write : function(user, title, txt, date, view) {
        return `Insert into ${pageFreeBoard.TB_Name}
                (FREE_BD_USER, FREE_BD_TITLE, FREE_BD_TEXT, FREE_BD_DATE, FREE_BD_VIEW_CNT) 
                Values ('${user}', '${title}', '${txt.replace(/'/g, "\\\'")}', '${date}', ${view})`;
    },
    View : function(free_no) {
        return `Select * From ${pageFreeBoard.TB_Name} 
                Where ${pageFreeBoard.TB_PK} = ${free_no}`;
    },
    ViewCnt : function(free_no) {
        return `Update ${pageFreeBoard.TB_Name} Set FREE_BD_VIEW_CNT = FREE_BD_VIEW_CNT + 1 
                Where ${pageFreeBoard.TB_PK} = ${free_no}`;
    },
    Modify : function(title, txt, free_no) {
        return `Update ${pageFreeBoard.TB_Name} Set FREE_BD_TITLE = '${title}', FREE_BD_TEXT = '${txt}'
                Where ${pageFreeBoard.TB_PK} = ${free_no}`;
    }
}


app.get(pageFreeBoard.list_RoutePath, function (req, res) {
    let pagedata;
    client.query(FreeBoard_Query.Count(), function (cnt_error, settings) {
        cnt_error ? console.log(`Setting Data Error ${cnt_error}`) 
        : (()=> {
            pagedata = {
                "name" : pageFreeBoard.pageName,
                "items": +req.params.items,
                "cpage": req.query.page ?? 1,
                "tpage": (settings[0].cnt % req.params.items == 0) ? parseInt(settings[0].cnt / req.params.items) : parseInt(settings[0].cnt / req.params.items)+1,
                "total": settings[0].cnt,
                "start": (Number(req.query.page ?? 1) - 1) * req.params.items,
                "authority" : req.query.authority ?? 1
            };
        })();

        client.query(FreeBoard_Query.List(pagedata["start"], pagedata["items"]), function (list_err, list_result) {
            list_err ? console.log(`Getting Data Error ${list_err}`) 
            : (()=> {
                res.render(pageFreeBoard.list_HTML, { results: {
                    result : list_result,
                    pagedata: pagedata
                }, SD : sessionData });
            })();
        });
    });
});

app.get(pageFreeBoard.write_RoutePath, chk_Login, function (req, res) {
    res.render(pageFreeBoard.write_HTML, {SD : sessionData, name: pageFreeBoard.pageName});
});

app.post(pageFreeBoard.write_RoutePath, function (req, res) {
    const { content_tit, content_user, content_txt } = req.body;
    const cont_date = getdate.date2String(new Date(), "-");
    client.query(FreeBoard_Query.Write(content_user, content_tit, content_txt, cont_date, 0), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pageFreeBoard.redirect_RoutePath(req.params.items));
    });
});

app.get(pageFreeBoard.view_RoutePath, function (req, res) {
    client.query(FreeBoard_Query.View(req.params.free_no), function (view_data_err, result) {
        view_data_err ? console.log(`Getting FreeBoard Content Data Error ${view_data_err}`) 
        : (()=> {
            client.query(FreeBoard_Query.ViewCnt(req.params.free_no), (view_cnt_err, updateResult)=>{
                if(view_cnt_err) console.log(`Increase View Count Error ${view_cnt_err}`);
            }); 
            res.render(pageFreeBoard.view_HTML, {
                result: result[0], 
                name: pageFreeBoard.pageName,
                SD : sessionData
            });
        })();
    });
});

// Modify Free Board Contents
app.get(pageFreeBoard.modify_RoutePath, chk_Login, function (req, res) {
    client.query(FreeBoard_Query.View(req.params.free_no), function(err, result) {
        res.render(pageFreeBoard.modify_HTML, {
            result : result[0], 
            name: pageFreeBoard.pageName, 
            free_no: req.params.free_no,
            SD : sessionData
        });
    });
});

app.post(pageFreeBoard.modify_RoutePath, function (req, res) {
    const { content_tit, content_txt, free_no } = req.body;
    client.query(FreeBoard_Query.Modify(content_tit, content_txt, free_no), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pageFreeBoard.redirect_RoutePath(10));
    });
});



// Portfolio
const pagePortfolio = {
    // Page Name
    pageName: "portfolio",

    // Table Name
    TB_Name : dbList.portfolioTB,
    TB_PK : "PORTFOLIO_NO_PK",

    // Route Path
    list_RoutePath : "/board/list/portfolio/:items",
    write_RoutePath : "/board/write/portfolio/:items",
    view_RoutePath : "/board/view/portfolio/:portfolio_no",
    modify_RoutePath : "/board/modify/portfolio/:portfolio_no",

    // HTML
    list_HTML : "list/portfolio.ejs",
    write_HTML : "write/portfolio.ejs",
    view_HTML : "view/portfolio.ejs",
    modify_HTML : "modify/portfolio.ejs",

    // Redirect
    redirect_RoutePath : (items)=> {
        return `/board/list/portfolio/${items}`;
    }
};

const Portfolio_Query = {
    Count : function() {
        return `Select count(*) as cnt from ${pagePortfolio.TB_Name}`;
    },
    List : function(start, items) {
        return `Select * from ${pagePortfolio.TB_Name} 
                Order by ${pagePortfolio.TB_PK} DESC Limit ${start}, ${items}`;
    },
    Write : function(lang, title, txt, date, view) {
        return `Insert into ${pagePortfolio.TB_Name} 
        (PORTFOLIO_LANG, PORTFOLIO_TITLE, PORTFOLIO_TEXT, PORTFOLIO_DATE, PORTFOLIO_VIEW_CNT) 
        Values ('${lang}', '${title}', '${txt.replace(/'/g, "\\\'")}', '${date}', ${view})`;
    },
    View : function(portfolio_no) {
        return `Select * From ${pagePortfolio.TB_Name}
                Where ${pagePortfolio.TB_PK} = ${portfolio_no}`;
    },
    ViewCnt : function(portfolio_no) {
        return `Update ${pagePortfolio.TB_Name} Set PORTFOLIO_VIEW_CNT = PORTFOLIO_VIEW_CNT + 1 
                Where ${pagePortfolio.TB_PK} = ${portfolio_no}`;
    },
    Modify : function(lang, title, txt, portfolio_no) {
        return `Update ${pagePortfolio.TB_Name} Set PORTFOLIO_LANG = ${lang}, PORTFOLIO_TITLE = '${title}', 
                PORTFOLIO_TEXT = '${txt}' Where ${pagePortfolio.TB_PK} = ${portfolio_no}`;
    }
};

// Portfolio
app.get(pagePortfolio.list_RoutePath, function (req, res) {
    let pagedata;
    client.query(Portfolio_Query.Count(), function (cnt_error, settings) {
        cnt_error ? console.log(`Setting Data Error ${cnt_error}`) 
        : (()=> {
            pagedata = {
                "name" : pagePortfolio.pageName,
                "items": +req.params.items,
                "cpage": req.query.page ?? 1,
                "tpage": (settings[0].cnt % req.params.items == 0) ? parseInt(settings[0].cnt / req.params.items) : parseInt(settings[0].cnt / req.params.items)+1,
                "total": settings[0].cnt,
                "start": (Number(req.query.page ?? 1) - 1) * req.params.items,
                "authority" : req.query.authority ?? 1
            };
        })();

        client.query(Portfolio_Query.List(pagedata["start"], pagedata["items"]), function (list_err, list_result) {
            list_err ? console.log(`Getting Data Error ${list_err}`) 
            : (()=> {
                res.render(pagePortfolio.list_HTML, { results: {
                    result : list_result,
                    pagedata: pagedata
                }, SD : sessionData });
            })();
        });
    });
});

app.get(pagePortfolio.write_RoutePath, chk_Login, function (req, res) {
    res.render(pagePortfolio.write_HTML, {SD : sessionData, name: pagePortfolio.pageName});
});

app.post(pagePortfolio.write_RoutePath, function (req, res) {
    const { content_tit, content_lang, content_txt } = req.body;
    const cont_date = getdate.date2String(new Date(), "-");
    client.query(Portfolio_Query.Write(content_lang, content_tit, content_txt, cont_date, 0), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pagePortfolio.redirect_RoutePath(req.params.items));
    });
});

app.get(pagePortfolio.view_RoutePath, function (req, res) {
    client.query(Portfolio_Query.View(req.params.portfolio_no), function (view_data_err, result) {
        view_data_err ? console.log(`Getting Portfolio Content Data Error ${view_data_err}`) 
        : (()=> {
            client.query(Portfolio_Query.ViewCnt(req.params.portfolio_no), (view_cnt_err, updateResult)=>{
                if(view_cnt_err) console.log(`Increase View Count Error ${view_cnt_err}`);
            }); 
            res.render(pagePortfolio.view_HTML, {
                result: result[0], 
                name: pagePortfolio.pageName,
                SD : sessionData
            });
        })();
    });
});

// Modify Portfolio Board Contents
app.get(pagePortfolio.modify_RoutePath, chk_Login, function (req, res) {
    client.query(Portfolio_Query.View(req.params.portfolio_no), function(err, result) {
        res.render(pagePortfolio.modify_HTML, {
            result : result[0], 
            name: pagePortfolio.pageName, 
            portfolio_no: req.params.portfolio_no,
            SD : sessionData
        });
    });
});

app.post(pagePortfolio.modify_RoutePath, function (req, res) {
    const { content_tit, content_lang, content_txt, portfolio_no } = req.body;
    client.query(Portfolio_Query.Modify(content_lang, content_tit, content_txt, portfolio_no), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pagePortfolio.redirect_RoutePath(10));
    });
});


const pageItDevDiary = {
    // Page Name
    pageName : "itdev",

    // Table Name
    TB_Name : dbList.itDevTB,
    TB_PK : "IT_DEV_NO_PK",

    // Route Path
    list_RoutePath : "/board/list/itdev/:items",
    write_RoutePath : "/board/write/itdev/:items",
    view_RoutePath : "/board/view/itdev/:itdev_no",
    modify_RoutePath : "/board/modify/itdev/:itdev_no",

    // HTML
    list_HTML : "list/itDevDiary.ejs",
    write_HTML : "write/itDevDiary.ejs",
    view_HTML : "view/itDevDiary.ejs",
    modify_HTML : "modify/itDevDiary.ejs",

    // Redirect
    redirect_RoutePath : (items)=> {
        return `/board/list/itdev/${items}`;
    }
};

const ItDevDiary_Query = {
    Count : function() {
        return `Select count(*) as cnt from ${pageItDevDiary.TB_Name}`;
    },
    List : function(start, items) {
        return `Select * from ${pageItDevDiary.TB_Name} 
                Order by ${pageItDevDiary.TB_PK} DESC Limit ${start}, ${items}`;
    },
    Write : function(lang, title, txt, date, view) {
        return `Insert into ${pageItDevDiary.TB_Name} 
        (IT_DEV_LANG, IT_DEV_TITLE, IT_DEV_TEXT, IT_DEV_DATE, IT_DEV_VIEW_CNT) 
        Values ('${lang}', '${title}', '${txt.replace(/'/g, "\\\'")}', '${date}', ${view})`;
    },
    View : function(itdev_no) {
        return `Select * From ${pageItDevDiary.TB_Name}
                Where ${pageItDevDiary.TB_PK} = ${itdev_no}`;
    },
    ViewCnt : function(itdev_no) {
        return `Update ${pageItDevDiary.TB_Name} Set IT_DEV_VIEW_CNT = IT_DEV_VIEW_CNT + 1 
                Where ${pageItDevDiary.TB_PK} = ${itdev_no}`;
    },
    Modify : function(lang, title, txt, itdev_no) {
        return `Update ${pageItDevDiary.TB_Name} Set IT_DEV_LANG = '${lang}', IT_DEV_TITLE = '${title}', 
                IT_DEV_TEXT = '${txt}' Where ${pageItDevDiary.TB_PK} = ${itdev_no}`;
    }
};

// IT Dev Diary
app.get(pageItDevDiary.list_RoutePath, function (req, res) {
    let pagedata;
    client.query(ItDevDiary_Query.Count(), function (cnt_error, settings) {
        cnt_error ? console.log(`Setting Data Error ${cnt_error}`) 
        : (()=> {
            pagedata = {
                "name" : pageItDevDiary.pageName,
                "items": +req.params.items,
                "cpage": req.query.page ?? 1,
                "tpage": (settings[0].cnt % req.params.items == 0) ? parseInt(settings[0].cnt / req.params.items) : parseInt(settings[0].cnt / req.params.items)+1,
                "total": settings[0].cnt,
                "start": (Number(req.query.page ?? 1) - 1) * req.params.items,
                "authority" : req.query.authority ?? 1
            };
        })();

        client.query(ItDevDiary_Query.List(pagedata["start"], pagedata["items"]), function (list_err, list_result) {
            list_err ? console.log(`Getting Data Error ${list_err}`) 
            : (()=> {
                res.render(pageItDevDiary.list_HTML, { results: {
                    result : list_result,
                    pagedata: pagedata
                }, SD : sessionData });
            })();
        });
    });
});

app.get(pageItDevDiary.write_RoutePath, chk_Login, function (req, res) {
    res.render(pageItDevDiary.write_HTML, {SD : sessionData, name: pageItDevDiary.pageName});
});

app.post(pageItDevDiary.write_RoutePath, function (req, res) {
    const { content_tit, content_lang, content_txt } = req.body;
    const cont_date = getdate.date2String(new Date(), "-");
    client.query(ItDevDiary_Query.Write(content_lang, content_tit, content_txt, cont_date, 0), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pageItDevDiary.redirect_RoutePath(req.params.items));
    });
});

app.get(pageItDevDiary.view_RoutePath, function (req, res) {
    client.query(ItDevDiary_Query.View(req.params.itdev_no), function (view_data_err, result) {
        view_data_err ? console.log(`Getting ItDevDiary Content Data Error ${view_data_err}`) 
        : (()=> {
            client.query(ItDevDiary_Query.ViewCnt(req.params.itdev_no), (view_cnt_err, updateResult)=>{
                if(view_cnt_err) console.log(`Increase View Count Error ${view_cnt_err}`);
            }); 
            res.render(pageItDevDiary.view_HTML, {
                result: result[0], 
                name: pageItDevDiary.pageName,
                SD : sessionData
            });
        })();
    });
});

// Modify ItDevDiary Board Contents
app.get(pageItDevDiary.modify_RoutePath, chk_Login, function (req, res) {
    client.query(ItDevDiary_Query.View(req.params.itdev_no), function(err, result) {
        res.render(pageItDevDiary.modify_HTML, {
            result : result[0], 
            name: pageItDevDiary.pageName, 
            itdev_no: req.params.itdev_no,
            SD : sessionData
        });
    });
});

app.post(pageItDevDiary.modify_RoutePath, function (req, res) {
    const { content_tit, content_lang, content_txt, itdev_no } = req.body;
    client.query(ItDevDiary_Query.Modify(content_lang, content_tit, content_txt, itdev_no), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pageItDevDiary.redirect_RoutePath(10));
    });
});


// SourceCode
const pageSourceCode = {
    // Page Name
    pageName : "sourcecode",

    // Table Name
    TB_Name : dbList.sourceTB,
    TB_PK : "SOURCE_CODE_NO_PK",

    // Route Path
    list_RoutePath : "/board/list/sourcecode/:items",
    write_RoutePath : "/board/write/sourcecode/:items",
    view_RoutePath : "/board/view/sourcecode/:sCode_no",
    modify_RoutePath : "/board/modify/sourcecode/:sCode_no",

    // HTML
    list_HTML : "list/sourceCode.ejs",
    write_HTML : "write/sourceCode.ejs",
    view_HTML : "view/sourceCode.ejs",
    modify_HTML : "modify/sourceCode.ejs",

    // Redirect
    redirect_RoutePath : (items)=> {
        return `/board/list/sourcecode/${items}`;
    }
};
                
const SourceCode_Query = {
    Count : function() {
        return `Select count(*) as cnt from ${pageSourceCode.TB_Name}`;
    },
    List : function(start, items) {
        return `Select * from ${pageSourceCode.TB_Name} 
                Order by ${pageSourceCode.TB_PK} DESC Limit ${start}, ${items}`;
    },
    Write : function(lang, title, txt, date, view) {
        return `Insert into ${pageSourceCode.TB_Name} 
        (SOURCE_CODE_LANG, SOURCE_CODE_TITLE, SOURCE_CODE_TEXT, SOURCE_CODE_DATE, SOURCE_CODE_VIEW_CNT) 
        Values ('${lang}', '${title}', '${txt.replace(/'/g, "\\\'")}', '${date}', ${view})`;
    },
    View : function(sCode_no) {
        return `Select * From ${pageSourceCode.TB_Name}
                Where ${pageSourceCode.TB_PK} = ${sCode_no}`;
    },
    ViewCnt : function(sCode_no) {
        return `Update ${pageSourceCode.TB_Name} Set SOURCE_CODE_VIEW_CNT = SOURCE_CODE_VIEW_CNT + 1 
                Where ${pageSourceCode.TB_PK} = ${sCode_no}`;
    },
    Modify : function(lang, title, txt, sCode_no) {
        return `Update ${pageSourceCode.TB_Name} Set SOURCE_CODE_LANG = '${lang}', SOURCE_CODE_TITLE = '${title}', 
                SOURCE_CODE_TEXT = '${txt}' Where ${pageSourceCode.TB_PK} = ${sCode_no}`;
    }
};

// SourceCode
app.get(pageSourceCode.list_RoutePath, function (req, res) {
    let pagedata;
    client.query(SourceCode_Query.Count(), function (cnt_error, settings) {
        cnt_error ? console.log(`Setting Data Error ${cnt_error}`) 
        : (()=> {
            pagedata = {
                "name" : pageSourceCode.pageName,
                "items": +req.params.items,
                "cpage": req.query.page ?? 1,
                "tpage": (settings[0].cnt % req.params.items == 0) ? parseInt(settings[0].cnt / req.params.items) : parseInt(settings[0].cnt / req.params.items)+1,
                "total": settings[0].cnt,
                "start": (Number(req.query.page ?? 1) - 1) * req.params.items,
                "authority" : req.query.authority ?? 1
            };
        })();

        client.query(SourceCode_Query.List(pagedata["start"], pagedata["items"]), function (list_err, list_result) {
            list_err ? console.log(`Getting Data Error ${list_err}`) 
            : (()=> {
                res.render(pageSourceCode.list_HTML, { results: {
                    result : list_result,
                    pagedata: pagedata
                }, SD : sessionData });
            })();
        });
    });
});

app.get(pageSourceCode.write_RoutePath, chk_Login, function (req, res) {
    res.render(pageSourceCode.write_HTML, {SD : sessionData, name: pageSourceCode.pageName});
});

app.post(pageSourceCode.write_RoutePath, function (req, res) {
    const { content_tit, content_lang, content_txt } = req.body;
    const cont_date = getdate.date2String(new Date(), "-");
    client.query(SourceCode_Query.Write(content_lang, content_tit, content_txt, cont_date, 0), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pageSourceCode.redirect_RoutePath(req.params.items));
    });
});

app.get(pageSourceCode.view_RoutePath, function (req, res) {
    client.query(SourceCode_Query.View(req.params.sCode_no), function (view_data_err, result) {
        view_data_err ? console.log(`Getting SourceCode Content Data Error ${view_data_err}`) 
        : (()=> {
            client.query(SourceCode_Query.ViewCnt(req.params.sCode_no), (view_cnt_err, updateResult)=>{
                if(view_cnt_err) console.log(`Increase View Count Error ${view_cnt_err}`);
            }); 
            res.render(pageSourceCode.view_HTML, {
                result: result[0], 
                name: pageSourceCode.pageName,
                SD : sessionData
            });
        })();
    });
});

// Modify SourceCode Board Contents
app.get(pageSourceCode.modify_RoutePath, chk_Login, function (req, res) {
    client.query(SourceCode_Query.View(req.params.sCode_no), function(err, result) {
        res.render(pageSourceCode.modify_HTML, {
            result : result[0], 
            name: pageSourceCode.pageName, 
            sCode_no: req.params.sCode_no,
            SD : sessionData
        });
    });
});

app.post(pageSourceCode.modify_RoutePath, function (req, res) {
    const { content_tit, content_lang, content_txt, sCode_no } = req.body;
    client.query(SourceCode_Query.Modify(content_lang, content_tit, content_txt, sCode_no), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pageSourceCode.redirect_RoutePath(10));
    });
});


// Gallery
const pageGallery = {
    // Page Name
    pageName : "gallery",

    // Table Name
    TB_Name : dbList.galleryTB,
    TB_PK : "GALLERY_NO_PK",

    // Route Path
    list_RoutePath : "/board/list/gallery/:items",
    write_RoutePath : "/board/write/gallery/:items",
    view_RoutePath : "/board/view/gallery/:gellery_no",
    modify_RoutePath : "/board/modify/gallery/:gellery_no",

    // HTML
    list_HTML : "list/gallery.ejs",
    write_HTML : "write/gallery.ejs",
    view_HTML : "view/gallery.ejs",
    modify_HTML : "modify/gallery.ejs",

    // Redirect
    redirect_RoutePath : (items)=> {
        return `/board/list/gallery/${items}`;
    }
}

const Gallery_Query = {
    Count : function() {
        return `Select count(*) as cnt from ${pageGallery.TB_Name}`;
    },
    List : function(start, items) {
        return `Select * from ${pageGallery.TB_Name} 
                Order by ${pageGallery.TB_PK} DESC Limit ${start}, ${items}`;
    },
    Write : function(user, title, txt, date, view) {
        return `Insert into ${pageGallery.TB_Name}
                (GALLERY_USER, GALLERY_TITLE, GALLERY_TEXT, GALLERY_DATE, GALLERY_VIEW_CNT) 
                Values ('${user}', '${title}', '${txt.replace(/'/g, "\\\'")}', '${date}', ${view})`;
    },
    View : function(gellery_no) {
        return `Select * From ${pageGallery.TB_Name} 
                Where ${pageGallery.TB_PK} = ${gellery_no}`;
    },
    ViewCnt : function(gellery_no) {
        return `Update ${pageGallery.TB_Name} Set GALLERY_VIEW_CNT = GALLERY_VIEW_CNT + 1 
                Where ${pageGallery.TB_PK} = ${gellery_no}`;
    },
    Modify : function(user, title, txt, gellery_no) {
        return `Update ${pageGallery.TB_Name} Set GALLERY_USER = '${user}', GALLERY_TITLE = '${title}', 
                GALLERY_TEXT = '${txt}' Where ${pageGallery.TB_PK} = ${gellery_no}`;
    }
}


app.get(pageGallery.list_RoutePath, function (req, res) {
    let pagedata;
    client.query(Gallery_Query.Count(), function (cnt_error, settings) {
        cnt_error ? console.log(`Setting Data Error ${cnt_error}`) 
        : (()=> {
            pagedata = {
                "name" : pageGallery.pageName,
                "items": +req.params.items,
                "cpage": req.query.page ?? 1,
                "tpage": (settings[0].cnt % req.params.items == 0) ? parseInt(settings[0].cnt / req.params.items) : parseInt(settings[0].cnt / req.params.items)+1,
                "total": settings[0].cnt,
                "start": (Number(req.query.page ?? 1) - 1) * req.params.items,
                "authority" : req.query.authority ?? 1
            };
        })();

        client.query(Gallery_Query.List(pagedata["start"], pagedata["items"]), function (list_err, list_result) {
            list_err ? console.log(`Getting Data Error ${list_err}`) 
            : (()=> {
                res.render(pageGallery.list_HTML, { results: {
                    result : list_result,
                    pagedata: pagedata
                }, SD : sessionData });
            })();
        });
    });
});

app.get(pageGallery.write_RoutePath, chk_Login, function (req, res) {
    res.render(pageGallery.write_HTML, {SD : sessionData, name: pageGallery.pageName});
});

app.post(pageGallery.write_RoutePath, function (req, res) {
    const { content_tit, content_user, content_txt } = req.body;
    const cont_date = getdate.date2String(new Date(), "-");
    client.query(Gallery_Query.Write(content_user, content_tit, content_txt, cont_date, 0), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pageGallery.redirect_RoutePath(req.params.items));
    });
});

app.get(pageGallery.view_RoutePath, function (req, res) {
    client.query(Gallery_Query.View(req.params.gellery_no), function (view_data_err, result) {
        view_data_err ? console.log(`Getting Gallery Content Data Error ${view_data_err}`) 
        : (()=> {
            client.query(Gallery_Query.ViewCnt(req.params.gellery_no), (view_cnt_err, updateResult)=>{
                if(view_cnt_err) console.log(`Increase View Count Error ${view_cnt_err}`);
            }); 
            res.render(pageGallery.view_HTML, {
                result: result[0], 
                name: pageGallery.pageName,
                SD : sessionData
            });
        })();
    });
});

// Modify Gallery Board Contents
app.get(pageGallery.modify_RoutePath, chk_Login, function (req, res) {
    client.query(Gallery_Query.View(req.params.gellery_no), function(err, result) {
        res.render(pageGallery.modify_HTML, {
            result : result[0], 
            name: pageGallery.pageName, 
            gellery_no: req.params.gellery_no,
            SD : sessionData
        });
    });
});

app.post(pageGallery.modify_RoutePath, function (req, res) {
    const { content_tit, content_user, content_txt, gellery_no } = req.body;
    client.query(Gallery_Query.Modify(content_user, content_tit, content_txt, gellery_no), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pageGallery.redirect_RoutePath(10));
    });
});


const pageYoutube = {
    // Page Name
    pageName : "youTubeClip",

    // Table Name
    TB_Name : dbList.youTubeTB,
    TB_PK : "YOU_TUBE_NO_PK",

    // Route Path
    list_RoutePath : "/board/list/youTubeClip/:items",
    write_RoutePath : "/board/write/youTubeClip/:items",
    view_RoutePath : "/board/view/youTubeClip/:youtube_no",
    modify_RoutePath : "/board/modify/youTubeClip/:youtube_no",

    // HTML
    list_HTML : "list/youTube.ejs",
    write_HTML : "write/youTube.ejs",
    view_HTML : "view/youTube.ejs",
    modify_HTML : "modify/youTube.ejs",

    // Redirect
    redirect_RoutePath : (items)=> {
        return `/board/list/youTubeClip/${items}`;
    }
}

const Youtube_Query = {
    Count : function() {
        return `Select count(*) as cnt from ${pageYoutube.TB_Name}`;
    },
    List : function(start, items) {
        return `Select * from ${pageYoutube.TB_Name} 
                Order by ${pageYoutube.TB_PK} DESC Limit ${start}, ${items}`;
    },
    Write : function(user, title, txt, date, view) {
        return `Insert into ${pageYoutube.TB_Name}
                (YOU_TUBE_USER, YOU_TUBE_TITLE, YOU_TUBE_TEXT, YOU_TUBE_DATE, YOU_TUBE_VIEW_CNT) 
                Values ('${user}', '${title}', '${txt.replace(/'/g, "\\\'")}', '${date}', ${view})`;
    },
    View : function(youtube_no) {
        return `Select * From ${pageYoutube.TB_Name} 
                Where ${pageYoutube.TB_PK} = ${youtube_no}`;
    },
    ViewCnt : function(youtube_no) {
        return `Update ${pageYoutube.TB_Name} Set YOU_TUBE_VIEW_CNT = YOU_TUBE_VIEW_CNT + 1 
                Where ${pageYoutube.TB_PK} = ${youtube_no}`;
    },
    Modify : function(user, title, txt, youtube_no) {
        return `Update ${pageYoutube.TB_Name} Set YOU_TUBE_USER = '${user}', YOU_TUBE_TITLE = '${title}', 
                YOU_TUBE_TEXT = '${txt}' Where ${pageYoutube.TB_PK} = ${youtube_no}`;
    }
}


app.get(pageYoutube.list_RoutePath, function (req, res) {
    let pagedata;
    client.query(Youtube_Query.Count(), function (cnt_error, settings) {
        cnt_error ? console.log(`Setting Data Error ${cnt_error}`) 
        : (()=> {
            pagedata = {
                "name" : pageYoutube.pageName,
                "items": +req.params.items,
                "cpage": req.query.page ?? 1,
                "tpage": (settings[0].cnt % req.params.items == 0) ? parseInt(settings[0].cnt / req.params.items) : parseInt(settings[0].cnt / req.params.items)+1,
                "total": settings[0].cnt,
                "start": (Number(req.query.page ?? 1) - 1) * req.params.items,
                "authority" : req.query.authority ?? 1
            };
        })();

        client.query(Youtube_Query.List(pagedata["start"], pagedata["items"]), function (list_err, list_result) {
            list_err ? console.log(`Getting Data Error ${list_err}`) 
            : (()=> {
                res.render(pageYoutube.list_HTML, { results: {
                    result : list_result,
                    pagedata: pagedata
                }, SD : sessionData });
            })();
        });
    });
});

app.get(pageYoutube.write_RoutePath, chk_Login, function (req, res) {
    res.render(pageYoutube.write_HTML, {SD : sessionData, name: pageYoutube.pageName});
});

app.post(pageYoutube.write_RoutePath, function (req, res) {
    const { content_tit, content_user, content_txt } = req.body;
    const cont_date = getdate.date2String(new Date(), "-");
    client.query(Youtube_Query.Write(content_user, content_tit, content_txt, cont_date, 0), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pageYoutube.redirect_RoutePath(req.params.items));
    });
});

app.get(pageYoutube.view_RoutePath, function (req, res) {
    client.query(Youtube_Query.View(req.params.youtube_no), function (view_data_err, result) {
        view_data_err ? console.log(`Getting Gallery Content Data Error ${view_data_err}`) 
        : (()=> {
            client.query(Youtube_Query.ViewCnt(req.params.youtube_no), (view_cnt_err, updateResult)=>{
                if(view_cnt_err) console.log(`Increase View Count Error ${view_cnt_err}`);
            }); 
            res.render(pageYoutube.view_HTML, {
                result: result[0], 
                name: pageYoutube.pageName,
                SD : sessionData
            });
        })();
    });
});

// Modify Gallery Board Contents
app.get(pageYoutube.modify_RoutePath, chk_Login, function (req, res) {
    client.query(Youtube_Query.View(req.params.youtube_no), function(err, result) {
        res.render(pageYoutube.modify_HTML, {
            result : result[0], 
            name: pageYoutube.pageName, 
            youtube_no: req.params.youtube_no,
            SD : sessionData
        });
    });
});

app.post(pageYoutube.modify_RoutePath, function (req, res) {
    const { content_tit, content_user, content_txt, youtube_no } = req.body;
    client.query(Youtube_Query.Modify(content_user, content_tit, content_txt, youtube_no), function (err) {
        err? console.log(`Insert Contents Error ${err}`) 
        : res.redirect(pageYoutube.redirect_RoutePath(10));
    });
});





// Server Start
app.listen(PORT, () => {
    console.log(`Port ${PORT} Started`);
});

// // Date2String Function
// function leftPad(value) {
//     if (value >= 10) {
//         return value;
//     }

//     return `0${value}`;
// }

// function toStringByFormatting(source, delimiter = '-') {
//     const year = source.getFullYear();
//     const month = leftPad(source.getMonth() + 1);
//     const day = leftPad(source.getDate());

//     return [year, month, day].join(delimiter);
// }