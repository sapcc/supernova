import { useState } from 'react'

const useModal = () => {
  const [modalIsShowing, setModalIsShowing] = useState(false)

  const toggleModal = () => {
    setModalIsShowing(!modalIsShowing)
  }

  return {
    modalIsShowing,
    toggleModal
  }
}

export default useModal