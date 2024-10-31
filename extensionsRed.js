export const FormExtension = {
  name: 'Forms',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_form' || trace.payload.name === 'ext_form',
  render: ({ trace, element }) => {
    const formContainer = document.createElement('form')

    formContainer.innerHTML = `
      <style>
        /* Container Styling */
        form {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          border: 2px solid #EE2A1E;
          border-radius: 10px;
          background-color: #fff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          font-family: Arial, sans-serif;
        }

        /* Label Styling */
        label {
          display: block;
          font-size: 1em;
          color: #EE2A1E;
          margin-bottom: 5px;
          font-weight: bold;
        }

        /* Input Fields Styling */
        input[type="text"],
        input[type="email"],
        input[type="tel"] {
          width: 100%;
          padding: 10px;
          border: 1px solid #EE2A1E;
          border-radius: 5px;
          margin-bottom: 15px;
          font-size: 1em;
          transition: border-color 0.3s;
        }

        /* Input Focus Styling */
        input[type="text"]:focus,
        input[type="email"]:focus,
        input[type="tel"]:focus {
          border-color: #d91914;
          outline: none;
          box-shadow: 0 0 5px rgba(238, 42, 30, 0.5);
        }

        /* Invalid Input Styling */
        .invalid {
          border-color: red;
        }

        /* Submit Button Styling */
        .submit {
          background-color: #EE2A1E;
          border: none;
          color: white;
          padding: 12px;
          border-radius: 5px;
          width: 100%;
          font-size: 1em;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.2s;
        }

        /* Submit Button Hover Effect */
        .submit:hover {
          background-color: #d91914;
          transform: translateY(-2px);
        }

        /* Responsive Design */
        @media (max-width: 500px) {
          form {
            padding: 15px;
          }
          .phone {
            width: 100%;
          }
        }
      </style>

      <label for="name">Navn</label>
      <input type="text" class="name" name="name" required placeholder="Ditt navn">

      <label for="email">E-post</label>
      <input type="email" class="email" name="email" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Ugyldig e-postadresse" placeholder="du@example.com">

      <label for="phone">Telefonnummer</label>
      <input type="tel" class="phone" name="phone" required pattern="\\d+" title="Ugyldig telefonnummer, vennligst oppgi kun tall" placeholder="1234567890">

      <input type="submit" class="submit" value="Send">
    `

    formContainer.addEventListener('submit', function (event) {
      event.preventDefault()

      const name = formContainer.querySelector('.name')
      const email = formContainer.querySelector('.email')
      const phone = formContainer.querySelector('.phone')

      // Remove previous invalid classes
      name.classList.remove('invalid')
      email.classList.remove('invalid')
      phone.classList.remove('invalid')

      // Validate inputs
      if (
        !name.checkValidity() ||
        !email.checkValidity() ||
        !phone.checkValidity()
      ) {
        if (!name.checkValidity()) name.classList.add('invalid')
        if (!email.checkValidity()) email.classList.add('invalid')
        if (!phone.checkValidity()) phone.classList.add('invalid')
        return
      }

      formContainer.querySelector('.submit').disabled = true
      formContainer.querySelector('.submit').value = 'Sender...'

      window.voiceflow.chat.interact({
        type: 'complete',
        payload: { name: name.value, email: email.value, phone: phone.value },
      }).then(() => {
        formContainer.innerHTML = `
          <p style="color: #EE2A1E; text-align: center; font-weight: bold;">Takk for at du sendte inn skjemaet!</p>
        `
      }).catch(() => {
        formContainer.querySelector('.submit').disabled = false
        formContainer.querySelector('.submit').value = 'Send'
        alert('Det oppstod en feil ved innsending av skjemaet. Vennligst prøv igjen.')
      })
    })

    element.appendChild(formContainer)
  },
}
