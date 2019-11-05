import { useState } from 'react'

const useModal = () => {
  const [modalIsShowing, setModalIsShowing] = useState(false)

  const toggleModal = () => {
    setModalIsShowing(!modalIsShowing)
  }

  return {
    modalIsShowing,
    toggleModal,
    openModal: () => setModalIsShowing(true),
    closeModal: () => setModalIsShowing(false)
  }
}

export default useModal