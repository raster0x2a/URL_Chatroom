main();

async function main() {
    await import("https://raster0x2a.github.io/JSFrame.js/public/jsframe.js");
    const fb = await import("https://www.gstatic.com/firebasejs/9.6.3/firebase-app.js");
    const fs = await import("https://www.gstatic.com/firebasejs/9.6.3/firebase-firestore.js");
    const uuidv4 = await import("https://jspm.dev/uuid");

    // JSFrame
    const jsFrame = new JSFrame();
    const frame = jsFrame.create({
        title: 'URL Chatroom',
        left: 20, top: 20, width: 320, height: 220,
        movable: true,
        resizable: true,
        html: '<div id="chat-window" style="padding:5px !important;margin: 0 !important;font-size:14px !important;color:#bbb !important;width:100% !important;height: 100% !important;border-radius:0 !important;"></div>'
    });
    frame.show();
    frame.$('#chat-window').innerHTML = 
        '<div id="msg-field" style="' + //@charset "UTF-8";html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video{margin:0;padding:0;border:none;font-style:normal;text-align:left;zoom:1;}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block;}table{border-collapse:collapse;font-family:inherit;}h1,h2,h3,h4,h5{font-size:100%;font-weight:normal;line-height:1;}input,textarea,select{font-family:inherit;font-size:16px;}input[type="button"],input[type="text"],input[type="submit"]{-webkit-appearance:none;border-radius:0;}textarea{resize:none;-webkit-appearance:none;border-radius:0;}th,td{border-collapse:collapse;}table th,table td{white-space:nowrap;}ul,ol{list-style-type:none;}img{vertical-align:text-bottom;vertical-align:-webkit-baseline-middle;max-width:100%;height:auto;width /***/:auto;};' +
        'height: 80% !important;overflow-y: scroll !important;padding:0 !important;margin: 0 !important;font-size:14px !important;color:#bbb !important;width:100% !important;border-radius:0 !important;color:#333 !important;"></div>' +
        '<div style="position: absolute;bottom: 1em;height 100% !important;padding:0 !important;margin: 0 !important;font-size:14px !important;color:#333 !important;width:100% !important;border-radius:0 !important;">' +
            '<input id="input-name" placeholder="name" type="text" style="border: 1px solid #bbb !important;outline:0;width: 15% ;height: 100% !important;padding:0 !important;margin: 0 !important;font-size:14px !important;border-radius:0 !important;color:#333 !important;"/>' +
            '<input id="input-message" placeholder="message" type="text" style="border: 1px solid #bbb !important;outline:0;width: 80% ;height: 100% !important;padding:0 !important;margin: 0 !important;font-size:14px !important;border-radius:0 !important;color:#333 !important;"/>' +
            //'<input id="send-btn" type="button" style="bottom:0;" value=""/>' +
        '</div>';

    // Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyD4fbdQ-O5wTYD34bmVBRwg-JnQPV0Q5Uk",
        authDomain: "url-chatroom.firebaseapp.com",
        projectId: "url-chatroom",
        storageBucket: "url-chatroom.appspot.com",
        messagingSenderId: "330460422738",
        appId: "1:330460422738:web:7cd939383a24e7eb99b58b",
        measurementId: "G-6RFELP70DH"
    };
    const firebaseApp = fb.initializeApp(firebaseConfig);
    const db = fs.getFirestore();

    const chatroomName = encodeURIComponent(location.hostname + location.pathname);
    const docRef = fs.doc(db, "chatroom", chatroomName);
    
    // 初回チャット表示
    const docSnap = await fs.getDoc(docRef);
    if (docSnap.exists()) {
        updateChat(docSnap.data());
    }   
    
    function updateChat(messageData){
        const sortedMessageData = sortMessage(messageData);
        frame.$('#msg-field').innerHTML = "";
        sortedMessageData.forEach((data) => {
            //console.log("Document data:", data);
            frame.$('#msg-field').innerHTML += '<div id="msg-' + data.uuid + '" style="border-bottom: 2px solid #bbb;height: auto !important;padding:0 !important;margin: 0 !important;font-size:14px !important;width:100% !important;border-radius:0 !important;">' + 
                                                    '<span class="chat-name" style="color:#333;height: auto !important;padding:0 !important;margin: 0 !important;font-size:14px !important;width:100% !important;border-radius:0 !important;"></span>' +
                                                    ':' +
                                                    '<span class="chat-message" style="color:#333;height: auto !important;padding:0 !important;margin: 0 !important;font-size:14px !important;width:100% !important;border-radius:0 !important;"></span>' + 
                                                '</div>';
            frame.$('#msg-' + data.uuid + ' > .chat-name').innerText = data.name;
            frame.$('#msg-' + data.uuid + ' > .chat-message').innerText = data.message;
        });
        frame.$('#msg-field').scrollTo(0, frame.$('#msg-field').scrollHeight);
    }

    function sortMessage(messageData){
        return Object.values(messageData).sort((a, b) => {
            if(a.datetime>b.datetime) return 1;
            if(a.datetime<b.datetime) return -1;
            return 0;
        });
    }

    function sendMessage() {
        const newUuid = uuidv4.v4();
        fs.setDoc(docRef, {
            [newUuid]: {
                uuid: newUuid,
                name: frame.$('#input-name').value,
                message: frame.$('#input-message').value,
                datetime: (new Date()).getTime()
            }
        }, {merge: true});

        frame.$('#input-message').value = "";
    }

    // Enterで送信
    window.document.onkeydown = function(event){
        if (event.key === 'Enter' && frame.$('#input-message').value !== "") {
            sendMessage();
        }
    };

    // リアルタイムにチャット欄を更新
    fs.onSnapshot(docRef, (doc) => {
        //console.log(doc.data());
        if (doc.exists()) {
            updateChat(doc.data());
        }
        //unsubscribe();
    });
}