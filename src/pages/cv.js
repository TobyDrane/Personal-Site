import React, { useState } from 'react'
import Layout from '../components/Layout'
import SEO from '../components/SEO'
import firebase from 'gatsby-plugin-firebase'

const CV = () => {
  const [formFields, setFormFields] = useState({
    email: '',
  })
  const [returnMessage, setReturnMessage] = useState()

  const onFormSubmit = () => {
    firebase
      .firestore()
      .collection('cv-requests')
      .doc(formFields.email)
      .set({
        email: formFields.email,
        sent: false,
        requested_at: new Date().toISOString(),
      })
      .then(() => {
        setReturnMessage('Request sent!')
      })
      .catch(error => {
        console.error(error)
        setReturnMessage(
          'Apologies, something went wrong :( Please contact me.'
        )
      })
  }

  return (
    <Layout>
      <SEO />
      <div className="master-container">
        <div className="about-body">
          Due to commercial sensitivity, please request a copy of my curriculum
          vitae.
          <div className="cv-form">
            {returnMessage ? (
              <>
                <p className="return-message">{returnMessage}</p>
              </>
            ) : (
              <>
                {' '}
                <div className="inputs">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={formFields.email}
                    onChange={e => setFormFields({ email: e.target.value })}
                  />
                </div>
                <div className="buttons">
                  <button onClick={onFormSubmit}>Request</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default CV
