import React, { useState, useEffect } from 'react'
import { default as ReactModal } from 'react-modal'

const Modal = ({
  isShown,
  onRequestClose,
  header,
  modalBody,
  modalFooter,
  customClassName,
}) => {
  if (isShown) {
    return (
      <ReactModal
        className={`${customClassName} modal-top`}
        isOpen={isShown}
        onRequestClose={onRequestClose}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2>{header}</h2>
          </div>
          <div className="modal-body">{modalBody}</div>
          <div className="modal-footer">{modalFooter}</div>
        </div>
      </ReactModal>
    )
  }
  return null
}

export default Modal
