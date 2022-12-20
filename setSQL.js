// Set Table Name Board
// Before Start -> npm install mysql

const mysql = require("mysql");
const bcrypt = require('bcrypt');
require('dotenv').config();

const conn = mysql.createConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
});

function queryStart(sql, dbname) {
    conn.query(`Drop Table if Exists ${dbname}`, (err, result)=> {
        err ? console.log(err) : console.log(result);
    });
    conn.query(sql, function(err, result) {
        err ? console.log(err) : (()=> {
            console.log(result);
            conn.query(`desc ${dbname}`, function(dese_err, dese_result) {
                err ? console.log(dese_err) : console.log(dese_result);
            });
        })();
    });
}

const tbList = {
    membersTB: "MEMBERS_TB",
    noticeTB : "NOTICE_TB",
    freeBoardTB : "FREE_BOARD_TB",
    galleryTB : "GALLERY_TB",
    youTubeTB : "YOU_TUBE_TB",
    portfolioTB : "PORTFOLIO_TB",
    itDevTB : "IT_DEV_TB",
    sourceTB : "SOURCE_CODE_TB"
}

let sql = "";
const TB_Create = {
    MEMBERS_TB: function() {
        sql = `Create table ${tbList.membersTB}
            (
                MEMBER_NO_PK INT PRIMARY KEY AUTO_INCREMENT,
                MEMBER_ID VARCHAR(15) NOT NULL,
                MEMBER_NAME VARCHAR(15) NOT NULL,
                MEMBER_PWD VARCHAR(455) NOT NULL,
                MEMBER_EMAIL VARCHAR(45) NOT NULL,
                MEMBER_KIND VARCHAR(5) NOT NULL
            )`;
        queryStart(sql, tbList.membersTB);
        const pwd = bcrypt.hashSync("1234", 10);
        sql = `Insert Into ${tbList.membersTB} (MEMBER_ID, MEMBER_NAME, MEMBER_PWD, MEMBER_EMAIL, MEMBER_KIND)
                Values('CellMin', 'SMS', '${pwd}', 'devcellmin@gamil.com', 'ADMIN')`;
        conn.query(sql, (err, result)=> {
            err ? console.log(err) : console.log(result);
        });
    },
    NOTICE_TB: function() {
        sql = `Create table ${tbList.noticeTB}
            (
                NOTICE_NO_PK INT PRIMARY KEY AUTO_INCREMENT,
                NOTICE_KIND VARCHAR(15) NOT NULL,
                NOTICE_TITLE VARCHAR(30) NOT NULL,
                NOTICE_TEXT TEXT NOT NULL,
                NOTICE_DATE VARCHAR(15) NOT NULL,
                NOTICE_VIEW_CNT INT NOT NULL
            )`;
        queryStart(sql, tbList.noticeTB);
    },
    FREE_BOARD_TB: function() {
        sql = `Create table ${tbList.freeBoardTB}
            (
                FREE_BD_NO_PK INT PRIMARY KEY AUTO_INCREMENT,
                FREE_BD_USER VARCHAR(15) NOT NULL,
                FREE_BD_TITLE VARCHAR(30) NOT NULL,
                FREE_BD_TEXT TEXT NOT NULL,
                FREE_BD_DATE VARCHAR(15) NOT NULL,
                FREE_BD_VIEW_CNT INT NOT NULL
            )`;
        queryStart(sql, tbList.freeBoardTB);
    },
    GALLERY_TB: function() {
        sql = `Create table ${tbList.galleryTB}
            (
                GALLERY_NO_PK INT PRIMARY KEY AUTO_INCREMENT,
                GALLERY_USER VARCHAR(15) NOT NULL,
                GALLERY_TITLE VARCHAR(30) NOT NULL,
                GALLERY_TEXT TEXT NOT NULL,
                GALLERY_DATE VARCHAR(15) NOT NULL,
                GALLERY_VIEW_CNT INT NOT NULL
            )`;
        queryStart(sql, tbList.galleryTB);
    },
    YOU_TUBE_TB: function() {
        sql = `Create table ${tbList.youTubeTB}
            (
                YOU_TUBE_NO_PK INT PRIMARY KEY AUTO_INCREMENT,
                YOU_TUBE_USER VARCHAR(15) NOT NULL,
                YOU_TUBE_TITLE VARCHAR(30) NOT NULL,
                YOU_TUBE_TEXT TEXT NOT NULL,
                YOU_TUBE_DATE VARCHAR(15) NOT NULL,
                YOU_TUBE_VIEW_CNT INT NOT NULL
            )`;
        queryStart(sql, tbList.youTubeTB);
    },
    PORTFOLIO_TB: function() {
        sql = `Create table ${tbList.portfolioTB}
            (
                PORTFOLIO_NO_PK INT PRIMARY KEY AUTO_INCREMENT,
                PORTFOLIO_LANG VARCHAR(15) NOT NULL,
                PORTFOLIO_TITLE VARCHAR(30) NOT NULL,
                PORTFOLIO_TEXT TEXT NOT NULL,
                PORTFOLIO_DATE VARCHAR(15) NOT NULL,
                PORTFOLIO_VIEW_CNT INT NOT NULL
            )`;
        queryStart(sql, tbList.portfolioTB);
    },
    IT_DEV_TB: function() {
        sql = `Create table ${tbList.itDevTB}
            (
                IT_DEV_NO_PK INT PRIMARY KEY AUTO_INCREMENT,
                IT_DEV_LANG VARCHAR(15) NOT NULL,
                IT_DEV_TITLE VARCHAR(30) NOT NULL,
                IT_DEV_TEXT TEXT NOT NULL,
                IT_DEV_DATE VARCHAR(15) NOT NULL,
                IT_DEV_VIEW_CNT INT NOT NULL
            )`;
        queryStart(sql, tbList.itDevTB);
    },
    SOURCE_CODE_TB: function() {
        sql = `Create table ${tbList.sourceTB}
            (
                SOURCE_CODE_NO_PK INT PRIMARY KEY AUTO_INCREMENT,
                SOURCE_CODE_LANG VARCHAR(15) NOT NULL,
                SOURCE_CODE_TITLE VARCHAR(30) NOT NULL,
                SOURCE_CODE_TEXT TEXT NOT NULL,
                SOURCE_CODE_DATE VARCHAR(15) NOT NULL,
                SOURCE_CODE_VIEW_CNT INT NOT NULL
            )`;
        queryStart(sql, tbList.sourceTB);
    }
}

// Create All DB
Object.keys(tbList).forEach(tbname => {
    TB_Create[tbList[tbname]]();
})

// // Create Only One DB
// TB_Create[tbList["portfolioTB"]]();