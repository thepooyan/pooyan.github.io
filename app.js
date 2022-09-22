$(function () {
  //*query framework
  (function () {
    let dc = {
      query: (e) => {
        return query(document, e);
      },
      queries: (e) => {
        return queries(document, e);
      },
      id: (e) => {
        return getId(document, e);
      }
    }
    function getId(ele, trgt) {
      return querify(ele.getElementById(trgt))
    }
    function query(ele, trgt) {
      return querify(ele.querySelector(trgt))
    }
    function queries(ele, trgt) {
      return querify(ele.querySelectorAll(trgt))
    }

    function querify(ele) {
      if (!ele) return
      ele.query = (e) => query(ele, e);
      ele.queries = (e) => queries(ele, e);
      return ele
    }
    window.dc = dc;
  })()

  //* onclick system
  refreshOnClicks();
  function refreshOnClicks() {
    let clicker = dc.queries("[data-onClick]");

    clicker.forEach(item => {
      if (item.getAttribute('data-group')) {

        if (!item.clickEvent) {
          item.clickEvent = true;
          item.addEventListener("click", function () {
            dc.queries(`[data-group=${item.getAttribute('data-group')}`).forEach(item => {
              item.classList.remove(item.getAttribute("data-onClick"));
            })
            item.classList.toggle(item.getAttribute("data-onClick"));
          });
        }

      } else {

        if (!item.clickEvent) {
          item.clickEvent = true;
          item.addEventListener("click", function () {
            item.classList.toggle(item.getAttribute("data-onClick"));
          });
        }

      }
    })
  }

  //* Target system (grouped and single)
  let targeter = dc.queries('[data-target]');
  targeter.forEach(i => {
    let target = dc.query(i.dataset.target);
    if (target.dataset.group) {
      i.addEventListener('click', function () {
        dc.queries(`[data-group=${target.dataset.group}]`).forEach(item => {
          item.classList.remove('active');
        })
        target.classList.add('active');
      })
    } else {
      i.addEventListener('click', function () {
        target.classList.toggle('active');
      })
    }
  })

  // Add smooth scrolling to all links
  $("a[href^='#'].smooth").on('click', function (event) {
    if (this.hash !== "") {
      event.preventDefault();
      var hash = this.hash;
      window.location.hash = hash;

      $('html, body').animate({
        scrollTop: $(hash).offset().top + -30
      }, 900, function () {

      });
    }
  });

  //copy spot player code
  dc.queries('#spotPlayer i').forEach(item => {
    item.onclick = () => {
      let copyText = item.parentElement.querySelector('.code').innerHTML;
      navigator.clipboard.writeText(copyText);
      dc.queries('#spotPlayer i.copied').forEach(i => {
        i.classList.remove('copied')
      })
      item.classList.add('copied');
      setTimeout(() => {
        item.classList.remove('copied')
      }, 3000);
    }
  });

  //updload practice
  (function () {

    //input adder 
    dc.queries('#practiceModal i.fa-plus-circle').forEach(item => {
      item.addEventListener('click', () => {
        //clone the last input in the secition
        let clone = item.parentElement.querySelectorAll('.input');
        clone = clone[clone.length - 1];
        clone = clone.cloneNode(true);

        //increase index of clone by one
        let cloneFor = clone.querySelector('label').getAttribute('for');
        let cloneIndex = cloneFor[cloneFor.length - 1];

        let regex = new RegExp(`${cloneIndex}$`)
        let newFor = cloneFor.replace(regex, parseInt(cloneIndex) + 1);

        clone.querySelector('label').setAttribute('for', newFor);
        clone.querySelector('input').id = newFor;

        //set events and inner values of clone
        inputChangeHandler(clone.querySelector('input'));
        clone.querySelector('input').value = '';
        clone.querySelector('span').innerHTML = '';
        removerEvnt(clone.querySelector('i.fa-times'))

        clone.classList.add('hidden')
        item.parentElement.appendChild(clone);
        setTimeout(() => { document.querySelector('.input.hidden').classList.remove('hidden'); }, 10);
      })
    })

    //input remover
    function removerEvnt(item) {
      item.onclick = () => {
        let inputs = item.parentElement.parentElement.querySelectorAll('.input');
        if (inputs.length == 1) {
          inputs[0].value = '';
          item.parentElement.querySelector('span').innerHTML = '';
          return
        }
        item.parentElement.classList.add('hidden');
        setTimeout(() => { item.parentElement.remove() }, 200);
      }
    }
    dc.queries('#practiceModal i.fa-times').forEach(item => {
      removerEvnt(item)
    })

    //put the name of uploaded file into the box!
    function inputChangeHandler(item) {
      item.addEventListener('change', (e) => {
        item.parentElement.querySelector('span').innerHTML = e.target.value;
      })
    }
    dc.queries('#practiceModal input').forEach(item => { inputChangeHandler(item) })

    //clear all
    function clearPracticeForm() {
      dc.queries('#practiceModal .input label span').forEach(item => {
        item.innerHTML = '';
      })
      dc.query('#practiceModal').reset();
      dc.queries('#practiceModal .part').forEach(item => {
        let inputs = item.querySelectorAll('.input');
        if (inputs.length > 1) {

          inputs.forEach((i, index) => {
            if (index == inputs.length - 1) return
            i.remove();
          })
        }
      })
    }

    //upload submit
    dc.query('#practiceModal').onsubmit = (e) => {
      e.preventDefault();
      clearPracticeForm();
      alert('form submitted!')
    }
  })()

  //scroll chat to the end
  function scrollChat() {
    let chat = dc.query('#chat .veiw');
    $('#chat .veiw').animate({
      scrollTop: chat.scrollHeight + 500
    }, 900);
  }

  //get time in am/pm
  function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  let isReply = false;
  //create massage in chat
  function createMsg(text) {
    let chat = dc.query('#chat .veiw');
    let msg = chat.query('.sample');
    let newMsg = msg.cloneNode(true);

    //remove sample class
    newMsg.classList.remove('sample')

    //change username
    newMsg.querySelector('div').dataset.user = 'من';

    //change the inner text
    newMsg.querySelector('span .txt').innerHTML = text;

    //change time
    let time = formatAMPM(new Date());
    newMsg.querySelector('span').dataset.time = time;

    //new ID
    let lastId = dc.query('#chat .veiw > div:last-child').id;
    newMsg.id = ++lastId;

    //add reply
    if (isReply) {
      let a = document.createElement('a')
      a.href = `#${isReply.id}`;
      a.innerHTML = isReply.user;
      a.onclick = (e) => {scrollReplyEvnt(a, e)}
      newMsg.querySelector('span').appendChild(a);
    }

    return newMsg
  }

  //chat submit
  dc.query('#chat form').onsubmit = (e) => {
    chatSubmit(e);
  };

  function chatSubmit(e) {
    if (e.preventDefault) e.preventDefault();
    let input = dc.query('#chat form .input');

    let inputTxt = input.innerText;
    if (!inputTxt) return;
    inputTxt = inputTxt.replace(/\n/g, '<br/>');  //replace /n with br tag
    inputTxt = inputTxt.replace(/(<br\/>)+$/g, ''); //remove one or more occurence of br tag at the end of text

    dc.query('#chat .veiw').appendChild(createMsg(inputTxt));
    setReplyEvnt();
    scrollChat();
    mergeMsg();
    closeReply();
    input.innerText = '';
  }

  let br = false;
  //chat input details
  dc.query('#chat .input').onkeydown = (e) => {
    if (e.keyCode == 13 && !e.shiftKey) {
      chatSubmit(e);
    }
  }

  dc.query('#chat .input').onkeyup = (e) => {
    if (e.target.innerHTML === "<br>")
      e.target.innerHTML = '';
  }

  //merge massages
  function mergeMsg() {
    let prevUser, prevType;
    dc.queries('#chat .veiw > div').forEach(item => {
      let user = item.querySelector('div').dataset.user;
      let type = item.classList.contains('others') ? true : false;
      if (user === prevUser && type === prevType)
        item.classList.add('merge')
      prevUser = user;
      prevType = type;
    })
  }

  //reply
  let replySec = dc.query('#chat .reply');
  function closeReply() {
    replySec.classList.add('closed')
    isReply = false;
  }
  function openReply(trg) {
    replySec.classList.remove('closed');
    let clone = trg.cloneNode(true);
    replySec.query('div').replaceWith(clone)
    dc.query('#chat form > div').focus();
    let id = dc.query('#chat .reply > div').id;
    let user = replySec.query('.icon').dataset.user;
    isReply = { user, id };
  }
  function setReplyEvnt() {
    dc.queries('#chat .veiw > div').forEach(item => {
      item.querySelector('i').onclick = () => { openReply(item) };
    })
  }
  setReplyEvnt();
  dc.query('#chat .reply > i ').onclick = closeReply;

  //getDown
  let getDown = dc.query('#chat .wrap .getDown');
  getDown.onclick = scrollChat;


  //scroll events
  let chatVeiw = dc.query('#chat .veiw');
  chatVeiw.onscroll = () => {
    let scrollHeight = chatVeiw.scrollHeight - chatVeiw.offsetHeight;
    // console.log(`${chatVeiw.scrollTop} of ${scrollHeight}`)
    if (chatVeiw.scrollTop >= scrollHeight) {
      getDown.classList.remove('active')
    } else {
      getDown.classList.add('active')
    }
  }

  //scroll to reply
  dc.queries('#chat .veiw > div span a').forEach(item => {
    item.onclick = (e) => {scrollReplyEvnt(item, e)};
  })

  function scrollReplyEvnt(item, e) {
    if (item.hash !== "") {
      e.preventDefault();
      var hash = item.getAttribute('href');
      let target = dc.id(hash.substring(1));

      let header = dc.query('#chat header')

      $('#chat .veiw').animate(
        { scrollTop: target.offsetTop - header.offsetHeight - (chatVeiw.offsetHeight / 2), },
        900,
        () => { heighlightTrg(target) }
        );

      //heighlight reply
      function heighlightTrg(trg) {
        trg.classList.add('blink')
        trg.addEventListener('animationend', () => {
          trg.classList.remove('blink')
        }, { once: true })
      }

    }
  }

  mergeMsg();
  scrollChat();
})