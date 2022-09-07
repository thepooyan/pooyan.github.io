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
  $("a").on('click', function (event) {
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
      dc.queries('#spotPlayer i.copied').forEach(i=>{
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
          console.log(item)

          // for (let m=0; m < inputs.length; m++) {
          //   console.log(inputs[m])
          // }
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
    let chat = dc.query('.chat .veiw');
    chat.scrollTo(0, chat.scrollHeight + 500)
  }
  setTimeout(() => {
    scrollChat()
  }, 200);

  //get time in am/pm
  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  //create massage in chat
  function createMsg(text) {
    let chat = dc.query('.chat .veiw');
    let msg = chat.query('div:not(.others)');
    let newMsg = msg.cloneNode(true);

    //change username
    newMsg.querySelector('div').dataset.user = 'من';

    //change the inner text
    newMsg.querySelector('span').innerHTML = text;

    //change time
    let time = formatAMPM(new Date());
    newMsg.querySelector('span').dataset.time = time;

    return newMsg
  }

  //chat submit
  dc.query('.chat form').onsubmit = (e) => {
    chatSubmit(e);
  };

  function chatSubmit(e) {
    if (e.preventDefault) e.preventDefault();
    let label = dc.query('.chat form label');

    let inputTxt = label.innerText;
    inputTxt = inputTxt.replace(/\n/g, '<br/>');  //replace /n with br tag
    inputTxt = inputTxt.replace(/(<br\/>)+$/g, ''); //remove one or more occurence of br tag at the end of text

    dc.query('.chat .veiw').appendChild(createMsg(inputTxt));
    scrollChat();
    label.innerText = '';
  }

  //chat input details
  dc.query('.chat label').onkeydown = (e) => {
    if (e.keyCode == 13 && !e.shiftKey) {
      chatSubmit(e);
    }
  }




})