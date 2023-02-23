import React, { useEffect, useState, useRef } from 'react'
import Navbar from '../../components/Navbar'
import { useSelector } from 'react-redux'
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import FriendMsg from './../../components/FriendMsg';
import { GrSend ,GrFormClose} from 'react-icons/gr'
import { ImHappy } from 'react-icons/im'
import { BsCamera } from 'react-icons/bs'
import { MdMore } from 'react-icons/md'
import { AiFillLike, AiFillAudio } from 'react-icons/ai'
import { HiOutlinePhotograph } from 'react-icons/hi'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Container from '../../components/Container';
import moment from 'moment';
import ModalImage from "react-modal-image";
import { getStorage, ref as mref, uploadBytes, getDownloadURL,uploadString  } from "firebase/storage";
import { AudioRecorder } from 'react-audio-voice-recorder';
import ScrollToBottom from 'react-scroll-to-bottom';
import EmojiPicker from 'emoji-picker-react';
import Camera from 'react-html5-camera-photo';



const Chat = () => {
  const db = getDatabase();
  const storage = getStorage();
  let data = useSelector((state) => state.userLoginInfo.userInfo)
  let chatData = useSelector((state) => state.chatUserInfo.chatInfo)
  let [userInfoList, setUserInfoList] = useState([])
  let [msgList, setMsgList] = useState([])
  let [msg, setMsg] = useState('')
  let [imgMsgModal, setImgMsgModal] = useState(false)
  let [imgLink, setImgLink] = useState(null)
  let [audiofile, setAudioFile] = useState(null)
  let [audioModal, setAudioModal] = useState(null)
  let [emojishow, setEmojiShow] = useState(false)
  let [camaramodal, setCamaraModal] = useState(false)
  let [emoji, setEmoji] = useState(false)
  let [moreMsg, setMoreMsg] = useState(false)
  let [captureImg, setCaptureImg] = useState('')
  let emojiRef = useRef()

  useEffect(() => {
    const starCountRef = ref(db, 'userInfo/');
    onValue(starCountRef, (snapshot) => {
      let arr = []
      snapshot.forEach((item) => {
        if (data.uid == item.val().adminid) {
          arr.push({ ...item.val(), id: item.key })
        }
      })
      setUserInfoList(arr)
    });
  }, [])

  let handleMSg = (e) => {
    setMsg(e.target.value)
  }
  let handleMsgSend = () => {
    if (!msg) {
      set(push(ref(db, 'singleMsg/')), {
        whosendmsg: data.displayName,
        whosendmsgid: data.uid,
        whosendimg: data.photoURL,
        whorecivedmsg: chatData.name,
        whorecivedmsgid: chatData.id,
        whorecivedimg: chatData.img,
        msg: "&#128077",
        date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()} ${new Date().getHours()} ${new Date().getMinutes()}`

      })
      // toast.error("Please Write Something Then Send");
    } else {
      set(push(ref(db, 'singleMsg/')), {
        whosendmsg: data.displayName,
        whosendmsgid: data.uid,
        whosendimg: data.photoURL,
        whorecivedmsg: chatData.name,
        whorecivedmsgid: chatData.id,
        whorecivedimg: chatData.img,
        msg: msg,
        date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()} ${new Date().getHours()} ${new Date().getMinutes()}`

      }).then(() => {
        setMsg('')
      })
    }

  }

  useEffect(() => {
    const starCountRef = ref(db, 'singleMsg/');
    onValue(starCountRef, (snapshot) => {
      let arr = []
      snapshot.forEach((item) => {
        if (data.uid == item.val().whosendmsgid && chatData.id == item.val().whorecivedmsgid || data.uid == item.val().whorecivedmsgid && chatData.id == item.val().whosendmsgid) {
          arr.push({ ...item.val(), id: item.key })
        }
      })
      setMsgList(arr)
    });
  }, [chatData.id])

  let handleImgmsgFile = (e) => {
    const storageRef = mref(storage, e.target.files[0].name + 1);

    uploadBytes(storageRef, e.target.files[0]).then((snapshot) => {
      getDownloadURL(storageRef).then((downloadURL) => {
        setImgLink(downloadURL)
      });
    });
  }

  let handleImgMsgSend = () => {
    set(push(ref(db, 'singleMsg/')), {
      whosendmsg: data.displayName,
      whosendmsgid: data.uid,
      whosendimg: data.photoURL,
      whorecivedmsg: chatData.name,
      whorecivedmsgid: chatData.id,
      whorecivedimg: chatData.img,
      img: imgLink,
      date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()} ${new Date().getHours()} ${new Date().getMinutes()}`

    }).then(() => {
      setImgMsgModal(false)
    })
  }

  const addAudioElement = (blob) => {
    const url = URL.createObjectURL(blob);
    setAudioFile(blob)
  };

  let handleAudioSendMsg = () => {
    const storageRef = mref(storage, chatData.id + 1);
    uploadBytes(storageRef, audiofile).then((snapshot) => {
      getDownloadURL(storageRef).then((downloadURL) => {
        set(push(ref(db, 'singleMsg/')), {
          whosendmsg: data.displayName,
          whosendmsgid: data.uid,
          whosendimg: data.photoURL,
          whorecivedmsg: chatData.name,
          whorecivedmsgid: chatData.id,
          whorecivedimg: chatData.img,
          audio: downloadURL,
          date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()} ${new Date().getHours()} ${new Date().getMinutes()}`

        }).then(() => {
          setAudioModal(false)
        })
      });
    });
  }

  let handleEmojiselact = (emoji) => {
    setMsg(msg + emoji.emoji)
  }

  useEffect(() => {
    document.addEventListener('click', (e) => {
      if (emojiRef.current.contains(e.target)) {
        setEmojiShow(true)
      } else {
        setEmojiShow(false)
      }
    })
  }, [])
  function handleTakePhoto(dataUri) {
    setCaptureImg(dataUri)
    const storageRef = ref(storage, data.uid+10);
uploadString(storageRef,dataUri, 'data_url').then((snapshot) => {
  getDownloadURL(storageRef).then((downloadURL) => {
    console.log('File available at', downloadURL);
    set(push(ref(db, 'singleMsg/')), {
      whosendmsg: data.displayName,
      whosendmsgid: data.uid,
      whosendimg: data.photoURL,
      whorecivedmsg: chatData.name,
      whorecivedmsgid: chatData.id,
      whorecivedimg: chatData.img,
      img: downloadURL,
      date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()} ${new Date().getHours()} ${new Date().getMinutes()}`

    }).then(()=>{
      setCamaraModal(false)
    })
  });
});
  }

  let handleKeyPress=(e)=>{
    if(e.key=='Enter'){
      set(push(ref(db, 'singleMsg/')), {
        whosendmsg: data.displayName,
        whosendmsgid: data.uid,
        whosendimg: data.photoURL,
        whorecivedmsg: chatData.name,
        whorecivedmsgid: chatData.id,
        whorecivedimg: chatData.img,
        msg: msg,
        date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()} ${new Date().getHours()} ${new Date().getMinutes()}`

      }).then(() => {
        setMsg('')
      })
    }
  }
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Navbar active='msg' />
      <Container>
        <div class="flex  antialiased text-gray-800">
          <div class="lg:flex flex-row h-full w-full ">
            {/* left side  */}
            <div class="flex flex-col py-3 lg:py-8 pl-6 pr-2 w-full lg:w-[30%] bg-white flex-shrink-0">
              <div class="flex flex-row items-center justify-center h-12 w-full">
                <div class="ml-2 font-bold text-2xl">QuickChat</div>
              </div>
              <div
                class="hidden  lg:flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg"
              >
                <div class="h-20 w-20 rounded-full border overflow-hidden">
                  <img
                    src={data.photoURL}
                    alt="Avatar"
                    class="h-full w-full"
                  />
                </div>
                <div class="text-sm font-semibold mt-2">{data.displayName}</div>
                {userInfoList.map((item) => (

                  <div class="text-xs text-gray-500">{item.title}</div>
                ))}
                <div class="flex flex-row items-center mt-3">
                  <div
                    class="flex flex-col justify-center h-4 w-8 bg-indigo-500 rounded-full"
                  >
                    <div class="h-3 w-3 bg-white rounded-full self-end mr-1"></div>
                  </div>
                  <div class="leading-none ml-1 text-xs">Active</div>
                </div>
              </div>
              <FriendMsg />
            </div>
            {/* right side */}
            <div class="flex w-full flex-col flex-auto h-full lg:p-6">
              <div>
                <div className='w-full p-3 bg-[#8E8DDB] rounded-md '>
                  <div className='flex items-center gap-x-5'>
                    <div className='w-[70px] h-[70px] rounded-full overflow-hidden '>
                      {chatData.img ?
                        <img className='w-full h-full' src={chatData.img} alt="" />
                        :
                        <img src="images/user.jpg" alt="" />
                      }
                    </div>
                    <div >
                      <h2 className='font-primary text-white text-2xl '>{chatData.name}</h2>
                      <h3 className='font-primary text-white text-md mt-1'>Online</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4"
              >
                <div class="flex flex-col   mb-4">
                  <div class="flex flex-col  ">
                    <div class="">
                      <ScrollToBottom className='w-full h-72 lg:h-96  '>
                      {msgList.map((item) => (
                        data.uid == item.whosendmsgid ?
                          item.msg ?
                            (<div class="col-start-1 lg:col-start-6 col-end-13 p-3 rounded-lg">
                              <div class="flex items-center justify-start flex-row-reverse">
                                <div
                                  class="flex items-center justify-center h-[40px] w-[40px] rounded-full overflow-hidden"
                                >
                                  {data.uid == item.whosendmsgid ?
                                    chatData.id == item.whorecivedmsgid &&

                                    <img src={item.whosendimg} alt="" />
                                    :
                                    <img src={item.whorecivedimg} alt="" />
                                  }
                                </div>
                                <div className='flex items-center'>
                                  <div
                                    class="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl order-1"
                                  >
                                    <div dangerouslySetInnerHTML={{ __html: item.msg }} />
                                  </div>
                                  <p className='font-nunito font-normal text-xs mt-2 text-[#D7D7D7] mr-3'>{moment(item.date, "YYYYMMDD hhmm").fromNow()}</p>
                                </div>

                              </div>
                            </div>)
                            : item.img ?
                              (<div class="col-start-1 lg:col-start-6  col-end-13 p-3 rounded-lg">
                                <div class="flex items-center justify-start flex-row-reverse">
                                  <div
                                    class="flex items-center justify-center h-[40px] w-[40px] rounded-full overflow-hidden"
                                  >
                                    {data.uid == item.whosendmsgid ?
                                      chatData.id == item.whorecivedmsgid &&

                                      <img src={item.whosendimg} alt="" />
                                      :
                                      <img src={item.whorecivedimg} alt="" />
                                    }
                                  </div>
                                  <div className='flex items-center'>
                                    <div
                                      class="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl order-1"
                                    >
                                      <ModalImage className='w-[200px] h-[150px]'
                                        small={item.img}
                                        large={item.img}
                                      />
                                    </div>
                                    <p className='font-nunito font-normal text-xs mt-2 text-[#D7D7D7] mr-3'>{moment(item.date, "YYYYMMDD hhmm").fromNow()}</p>
                                  </div>

                                </div>
                              </div>)
                              :
                              (<div class="col-start-1 lg:col-start-6  col-end-13 p-3 rounded-lg">
                                <div class="flex items-center justify-start flex-row-reverse">
                                  <div
                                    class="flex items-center justify-center h-[40px] w-[40px] rounded-full overflow-hidden"
                                  >
                                    {data.uid == item.whosendmsgid ?
                                      chatData.id == item.whorecivedmsgid &&

                                      <img src={item.whosendimg} alt="" />
                                      :
                                      <img src={item.whorecivedimg} alt="" />
                                    }
                                  </div>
                                  <div className='flex items-center'>
                                    <div
                                      class="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl order-1"
                                    >
                                      <audio className='w-[250px]' controls>
                                        <source src={item.audio} type="audio/ogg" />

                                      </audio>
                                    </div>
                                    <p className='font-nunito font-normal text-xs mt-2 text-[#D7D7D7] mr-3'>{moment(item.date, "YYYYMMDD hhmm").fromNow()}</p>
                                  </div>

                                </div>
                              </div>)
                          : item.msg ?
                            (
                              <div class="col-start-1 col-end-13 lg:col-end-8 p-3 rounded-lg">
                                <div class="flex flex-row items-center">
                                  <div
                                    class="flex items-center justify-center h-[40px] w-[40px] rounded-full overflow-hidden"
                                  >
                                    {data.uid == item.whosendmsgid ?
                                      chatData.id == item.whorecivedmsgid &&

                                      <img src={item.whorecivedimg} alt="" />
                                      :
                                      <img src={item.whosendimg} alt="" />
                                    }
                                  </div>
                                  <div>
                                    <div
                                      class="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl"
                                    >
                                      <div dangerouslySetInnerHTML={{ __html: item.msg }} />
                                    </div>
                                  </div>
                                  <p className='font-nunito font-normal text-xs mt-2 text-[#D7D7D7] ml-3'>{moment(item.date, "YYYYMMDD hhmm").fromNow()}</p>
                                </div>
                              </div>
                            ) : item.img ?
                              (<div class="col-start-1 col-end-13 lg:col-end-8 p-3 rounded-lg">
                                <div class="flex flex-row items-center">
                                  <div class="flex items-center justify-center h-[40px] w-[40px] rounded-full overflow-hidden"
                                  >
                                    {data.uid == item.whosendmsgid ?
                                      chatData.id == item.whorecivedmsgid &&

                                      <img src={item.whorecivedimg} alt="" />
                                      :
                                      <img src={item.whosendimg} alt="" />
                                    }
                                  </div>
                                  <div>
                                    <div
                                      class="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl"
                                    >
                                      <ModalImage className='w-[200px] h-[150px]'
                                        small={item.img}
                                        large={item.img}
                                      />
                                    </div>
                                  </div>
                                  <p className='font-nunito font-normal text-xs mt-2 text-[#D7D7D7] ml-3'>{moment(item.date, "YYYYMMDD hhmm").fromNow()}</p>
                                </div>
                              </div>)
                              : (
                                <div class="col-start-1 col-end-13 lg:col-end-8 p-3 rounded-lg">
                                  <div class="flex flex-row items-center">
                                    <div
                                      class="flex items-center justify-center h-[40px] w-[40px] rounded-full overflow-hidden"
                                    >
                                      {data.uid == item.whosendmsgid ?
                                        chatData.id == item.whorecivedmsgid &&

                                        <img src={item.whorecivedimg} alt="" />
                                        :
                                        <img src={item.whosendimg} alt="" />
                                      }
                                    </div>
                                    <div>
                                      <div
                                        class="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl"
                                      >
                                        <audio className='w-[200px]' controls>
                                          <source src={item.audio} type="audio/ogg" />

                                        </audio>
                                      </div>
                                    </div>
                                    <p className='font-nunito font-normal text-xs mt-2 text-[#D7D7D7] ml-3'>{moment(item.date, "YYYYMMDD hhmm").fromNow()}</p>
                                  </div>
                                </div>
                              )
                      ))}
                        
                      </ScrollToBottom>




                    </div>
                  </div>
                </div>
                <div
                  class="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4"
                >
                  <div class="flex-grow lg:ml-4">
                    <div class="relative w-full">
                      <input
                        onChange={handleMSg}
                        onKeyUp={handleKeyPress}
                        value={msg}
                        type="text"
                        className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10
                      "
                      />
                      <div onClick={()=>setMoreMsg(!moreMsg)} className='lg:hidden absolute right-0 top-0 flex items-center justify-center h-full w-12 '><MdMore/></div>
                      {moreMsg&&
                      
                        <div>
                          <div className='absolute top-[-115px] right-0 w-[50px] h-[120px] bg-white border border-solid rounded-lg ease-in-out duration-300'></div>
                          <button
                        class="absolute flex items-center justify-center h-full w-12 right-0 top-[-30px] text-gray-400 hover:text-gray-600"
                      >
                        <HiOutlinePhotograph onClick={() => setImgMsgModal(true)} className='text-2xl' />
                      </button>
                      <div className=''>
                        <button class="absolute flex items-center justify-center h-full w-12 right-0 top-[-60px] text-gray-400 hover:text-gray-600"
                        >
                          <BsCamera onClick={() => setCamaraModal(true)} className='text-xl' />
                        </button>

                      </div>
                      <div className='absolute right-0 top-[-90px] flex items-center justify-center h-full w-12 '>
                        <button
                          className="  text-gray-400 hover:text-gray-600"
                        >
                          <AiFillAudio onClick={() => setAudioModal(true)} className='text-2xl' />

                        </button>
                        {audioModal &&
                          <div className='w-[300px] md:w-[350px] p-3  bg-[#F3F4F6] border border-solid absolute bottom-0 right-[-50px] lg:right-0 rounded-md shadow-lg z-50'>
                            <AudioRecorder onRecordingComplete={addAudioElement} />
                            <button onClick={handleAudioSendMsg} className='font-primary text-md bg-primary px-2 py-1 text-white rounded-md mt-2'>upload</button>
                            <button onClick={() => setAudioModal(false)} className='font-primary text-md bg-red-500 px-2 py-1 text-white rounded-md ml-2'>cancel</button>
                          </div>
                        }
                      </div>
                      <div ref={emojiRef} className='relative'>

                        <button
                          class="absolute flex items-center justify-center h-full w-12 right-0 top-[-140px] text-gray-400 hover:text-gray-600"
                        >
                          <ImHappy className='text-xl' />
                        </button>
                        {emojishow &&
                          <div className='w-full absolute bottom-10 right-8 lg:right-20'>
                            <EmojiPicker onEmojiClick={(emoji) => handleEmojiselact(emoji)} />
                          </div>
                        }

                      </div>
                        </div>
                      }
                      <div className=' lg:block hidden'>
                          <button
                        class="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600"
                      >
                        <HiOutlinePhotograph onClick={() => setImgMsgModal(true)} className='text-2xl' />
                      </button>
                      <div className=''>
                        <button class="absolute flex items-center justify-center h-full w-12 right-[110px] top-0 text-gray-400 hover:text-gray-600"
                        >
                          <BsCamera onClick={() => setCamaraModal(true)} className='text-2xl' />
                        </button>

                      </div>
                      <div className='absolute right-[75px] top-0 flex items-center justify-center h-full w-12 '>
                        <button
                          className="  text-gray-400 hover:text-gray-600"
                        >
                          <AiFillAudio onClick={() => setAudioModal(true)} className='text-2xl' />

                        </button>
                        {audioModal &&
                          <div className='w-[350px] p-3  bg-[#F3F4F6] border border-solid absolute bottom-0 right-0 rounded-md shadow-lg'>
                            <AudioRecorder onRecordingComplete={addAudioElement} />
                            <button onClick={handleAudioSendMsg} className='font-primary text-md bg-primary px-2 py-1 text-white rounded-md mt-2'>upload</button>
                            <button onClick={() => setAudioModal(false)} className='font-primary text-md bg-red-500 px-2 py-1 text-white rounded-md ml-2'>cancel</button>
                          </div>
                        }
                      </div>
                      <div ref={emojiRef} className='relative'>

                        <button
                          class="absolute flex items-center justify-center h-full w-12 right-10 top-[-20px] text-gray-400 hover:text-gray-600"
                        >
                          <ImHappy className='text-xl' />
                        </button>
                        {emojishow &&
                          <div className='absolute bottom-10 right-20'>
                            <EmojiPicker onEmojiClick={(emoji) => handleEmojiselact(emoji)} />
                          </div>
                        }

                      </div>
                        </div>
                    
                    </div>
                  </div>
                  <div class="ml-2 lg:ml-4">
                    {msg ?
                      <button onClick={handleMsgSend}
                        class="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0 gap-x-3"
                      >
                        <span className='font-primary text-md'>Send</span>
                        <GrSend className='text-white text-md ' />
                      </button>
                      :
                      <button onClick={handleMsgSend}
                        class="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0 gap-x-3"
                      >
                        <AiFillLike className=' text-white text-xl lg:text-2xl ' />
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {imgMsgModal &&
        <div className='w-full h-full bg-primary absolute top-[100%] lg:top-0 left-0 lg:flex justify-center items-center'>
          <div className='w-full lg:w-1/4  bg-white rounded-md p-2'>
            <h3 className='font-primary text-lg mb-2 font-medium'>Send Img </h3>
            <input onChange={handleImgmsgFile} className='font-primary mb-2 w-full' type="file" />
            {imgLink &&
              <img className='w-full h-[250px] ' src={imgLink} alt="" />
            }
            <button onClick={handleImgMsgSend} className='font-primary bg-primary text-md px-3 py-1 text-white mt-2 rounded-md'>Send</button>
            <button onClick={() => setImgMsgModal(false)} className='font-primary bg-red-500 text-md px-3 py-1 text-white mt-2 rounded-md ml-2'>Cancel</button>
          </div>
        </div>
      }
      {camaramodal &&
        <div className="absolute top-[100%] lg:top-0 left-0 w-full h-full bg-primary lg:flex items-center justify-center">
          <Camera
            onTakePhoto={(dataUri) => { handleTakePhoto(dataUri); }}
          />
            <GrFormClose onClick={()=>setCamaraModal(false)} className='absolute top-1/2 right-10 text-3xl bg-red-500 text-white'/>
        </div>
      }

    </>
  )
}

export default Chat