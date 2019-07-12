import { useState } from 'react'

const useModal = () => {
  const [modalIsShowing, setmodalIsShowing] = useState(false)

  const toggleModal = () => {
    console.log("toggle modal", modalIsShowing)
    setmodalIsShowing(!modalIsShowing)
  }

  return {
    modalIsShowing,
    toggleModal
  }
}

export default useModal