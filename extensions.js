// Extension 1: VideoExtension
const VideoExtension = {
  name: 'Video',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_video' || trace.payload.name === 'ext_video',
  render: ({ trace, element }) => {
    const videoElement = document.createElement('video');
    const { videoURL, autoplay, controls } = trace.payload;

    videoElement.width = 240;
    videoElement.src = videoURL;

    if (autoplay) {
      videoElement.setAttribute('autoplay', '');
    }
    if (controls) {
      videoElement.setAttribute('controls', '');
    }

    videoElement.addEventListener('ended', function () {
      window.voiceflow.chat.interact({ type: 'complete' });
    });

    element.appendChild(videoElement);
  },
};

// Extension 2: DisableInputExtension
const DisableInputExtension = {
  name: 'DisableInput',
  type: 'effect',
  match: ({ trace }) =>
    trace.type === 'ext_disableInput' ||
    trace.payload.name === 'ext_disableInput',
  effect: ({ trace }) => {
    const { isDisabled } = trace.payload;

    function disableInput() {
      const chatDiv = document.getElementById('voiceflow-chat');

      if (chatDiv) {
        const shadowRoot = chatDiv.shadowRoot;
        if (shadowRoot) {
          const chatInput = shadowRoot.querySelector('.vfrc-chat-input');
          const textarea = shadowRoot.querySelector(
            'textarea[id^="vf-chat-input--"]'
          );
          const button = shadowRoot.querySelector('.vfrc-chat-input--button');

          if (chatInput && textarea && button) {
            // Add a style tag if it doesn't exist
            let styleTag = shadowRoot.querySelector('#vf-disable-input-style');
            if (!styleTag) {
              styleTag = document.createElement('style');
              styleTag.id = 'vf-disable-input-style';
              styleTag.textContent = `
                .vf-no-border, .vf-no-border * {
                  border: none !important;
                }
                .vf-hide-button {
                  display: none !important;
                }
              `;
              shadowRoot.appendChild(styleTag);
            }

            function updateInputState() {
              textarea.disabled = isDisabled;
              if (!isDisabled) {
                textarea.placeholder = 'Message...';
                chatInput.classList.remove('vf-no-border');
                button.classList.remove('vf-hide-button');
                // Restore original value getter/setter
                Object.defineProperty(
                  textarea,
                  'value',
                  originalValueDescriptor
                );
              } else {
                textarea.placeholder = '';
                chatInput.classList.add('vf-no-border');
                button.classList.add('vf-hide-button');
                Object.defineProperty(textarea, 'value', {
                  get: function () {
                    return '';
                  },
                  configurable: true,
                });
              }

              // Trigger events to update component state
              textarea.dispatchEvent(
                new Event('input', { bubbles: true, cancelable: true })
              );
              textarea.dispatchEvent(
                new Event('change', { bubbles: true, cancelable: true })
              );
            }

            // Store original value descriptor
            const originalValueDescriptor = Object.getOwnPropertyDescriptor(
              HTMLTextAreaElement.prototype,
              'value'
            );

            // Initial update
            updateInputState();
          } else {
            console.error('Chat input, textarea, or button not found');
          }
        } else {
          console.error('Shadow root not found');
        }
      } else {
        console.error('Chat div not found');
      }
    }

    disableInput();
  },
};

// Extension 3: FileUploadExtension
const FileUploadExtension = {
  name: 'FileUpload',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_fileUpload' || trace.payload.name === 'ext_fileUpload',
  render: ({ trace, element }) => {
    const fileUploadContainer = document.createElement('div');
    fileUploadContainer.innerHTML = `
      <style>
        .my-file-upload {
          border: 2px dashed rgba(87, 24, 54, 0.3);
          padding: 20px;
          text-align: center;
          cursor: pointer;
        }
      </style>
      <div class='my-file-upload'>Cick to upload a file</div>
      <input type='file' style='display: none;'>
    `;

    const fileInput = fileUploadContainer.querySelector('input[type=file]');
    const fileUploadBox = fileUploadContainer.querySelector('.my-file-upload');

    fileUploadBox.addEventListener('click', function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      const file = fileInput.files[0];
      console.log('File selected:', file);

      fileUploadContainer.innerHTML = `
        <img src="https://s3.amazonaws.com/com.voiceflow.studio/share/upload/upload.gif"
             alt="Upload" width="50" height="50">
      `;

      var data = new FormData();
      data.append('file', file);

      fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: data,
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Upload failed: ' + response.statusText);
          }
        })
        .then((result) => {
          fileUploadContainer.innerHTML = `
            <img src="https://s3.amazonaws.com/com.voiceflow.studio/share/check/check.gif"
                 alt="Done" width="50" height="50">
          `;
          console.log('File uploaded:', result.data.url);
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: {
              file: result.data.url.replace(
                'https://tmpfiles.org/',
                'https://tmpfiles.org/dl/'
              ),
            },
          });
        })
        .catch((error) => {
          console.error(error);
          fileUploadContainer.innerHTML = '<div>Error during upload</div>';
        });
    });

    element.appendChild(fileUploadContainer);
  },
};

const FormExtension = {
  name: 'Forms',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'Custom_Form' || trace.payload.name === 'Custom_Form',
  render: ({ trace, element }) => {
    // Create the form element
    const formContainer = document.createElement('form');

    // Build the form HTML, including the file upload UI
    formContainer.innerHTML = `
      <style>
        label {
          font-size: 0.8em;
          color: #888;
        }
        input[type="text"], input[type="email"], textarea {
          width: 100%;
          border: none;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
          background: transparent;
          margin: 5px 0;
          outline: none;
          padding: 8px 0;
          resize: vertical;
        }
        .invalid {
          border-color: red;
        }
        .submit {
          background: #632340;
          border: none;
          color: white;
          padding: 10px;
          border-radius: 5px;
          width: 100%;
          cursor: pointer;
        }
        .my-file-upload {
          border: 2px dashed rgba(87, 24, 54, 0.3);
          padding: 20px;
          text-align: center;
          cursor: pointer;
          margin-bottom: 10px;
        }
        .upload-status {
          text-align: center;
          margin-bottom: 10px;
        }
      </style>

      <label for="email">E-mail</label>
      <input type="email" class="email" name="email" required
             pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
             title="Invalid email address"><br><br>

      <label for="topic">Topic</label>
      <input type="text" class="topic" name="topic" required><br><br>

      <label for="userQuestion">Question</label>
      <textarea class="userQuestion" name="userQuestion" required></textarea><br><br>

      <div class='my-file-upload'>Click here to upload any relevant screenshots</div>
      <input type='file' class='file-input' style='display: none;'>

      <div class="upload-status"></div>

      <input type="submit" class="submit" value="Submit">
    `;

    // Get references to the inputs
    const emailInput = formContainer.querySelector('.email');
    const topicInput = formContainer.querySelector('.topic');
    const userQuestionInput = formContainer.querySelector('.userQuestion');
    const fileInput = formContainer.querySelector('.file-input');
    const fileUploadBox = formContainer.querySelector('.my-file-upload');
    const uploadStatusDiv = formContainer.querySelector('.upload-status');
    const submitButton = formContainer.querySelector('.submit');

    // Prefill the form fields with the variables from trace.payload
    emailInput.value = trace.payload.email || '';
    topicInput.value = trace.payload.topic || '';
    userQuestionInput.value = trace.payload.userQuestion || '';

    // Variable to store the selected file
    let selectedFile = null;
    let fileUrl = null;

    // Variable to store original value descriptor
    let originalValueDescriptor = null;

    // File upload click handler
    fileUploadBox.addEventListener('click', function () {
      fileInput.click();
    });

    // File input change handler
    fileInput.addEventListener('change', function () {
      selectedFile = fileInput.files[0];
      if (selectedFile) {
        // Show file name in the UI
        fileUploadBox.textContent = 'File selected: ' + selectedFile.name;
      } else {
        fileUploadBox.textContent = 'Click here to upload any relevant screenshots';
      }
    });

    // Form input validation
    formContainer.addEventListener('input', function () {
      // Remove 'invalid' class when input becomes valid
      if (emailInput.checkValidity()) emailInput.classList.remove('invalid');
      if (topicInput.checkValidity()) topicInput.classList.remove('invalid');
      if (userQuestionInput.checkValidity()) userQuestionInput.classList.remove('invalid');
    });

    // Function to disable or enable the chat input
    function disableInput(isDisabled) {
      const chatDiv = document.getElementById('voiceflow-chat');

      if (chatDiv) {
        const shadowRoot = chatDiv.shadowRoot;
        if (shadowRoot) {
          const chatInput = shadowRoot.querySelector('.vfrc-chat-input');
          const textarea = shadowRoot.querySelector(
            'textarea[id^="vf-chat-input--"]'
          );
          const button = shadowRoot.querySelector('.vfrc-chat-input--button');

          if (chatInput && textarea && button) {
            // Add a style tag if it doesn't exist
            let styleTag = shadowRoot.querySelector('#vf-disable-input-style');
            if (!styleTag) {
              styleTag = document.createElement('style');
              styleTag.id = 'vf-disable-input-style';
              styleTag.textContent = `
                .vf-no-border, .vf-no-border * {
                  border: none !important;
                }
                .vf-hide-button {
                  display: none !important;
                }
              `;
              shadowRoot.appendChild(styleTag);
            }

            if (originalValueDescriptor === null) {
              // Store original value descriptor only once
              originalValueDescriptor = Object.getOwnPropertyDescriptor(
                Object.getPrototypeOf(textarea),
                'value'
              );
            }

            function updateInputState() {
              textarea.disabled = isDisabled;
              if (!isDisabled) {
                textarea.placeholder = 'Message...';
                chatInput.classList.remove('vf-no-border');
                button.classList.remove('vf-hide-button');
                // Restore original value getter/setter
                if (originalValueDescriptor) {
                  Object.defineProperty(
                    textarea,
                    'value',
                    originalValueDescriptor
                  );
                }
              } else {
                textarea.placeholder = '';
                chatInput.classList.add('vf-no-border');
                button.classList.add('vf-hide-button');
                if (originalValueDescriptor) {
                  Object.defineProperty(textarea, 'value', {
                    get: function () {
                      return '';
                    },
                    configurable: true,
                  });
                }
              }

              // Trigger events to update component state
              textarea.dispatchEvent(
                new Event('input', { bubbles: true, cancelable: true })
              );
              textarea.dispatchEvent(
                new Event('change', { bubbles: true, cancelable: true })
              );
            }

            // Update input state
            updateInputState();
          } else {
            console.error('Chat input, textarea, or button not found');
          }
        } else {
          console.error('Shadow root not found');
        }
      } else {
        console.error('Chat div not found');
      }
    }

    // Disable the chat input when the form is rendered
    disableInput(true);

    // Form submit handler
    formContainer.addEventListener('submit', function (event) {
      event.preventDefault();

      if (
        !emailInput.checkValidity() ||
        !topicInput.checkValidity() ||
        !userQuestionInput.checkValidity()
      ) {
        if (!emailInput.checkValidity()) emailInput.classList.add('invalid');
        if (!topicInput.checkValidity()) topicInput.classList.add('invalid');
        if (!userQuestionInput.checkValidity()) userQuestionInput.classList.add('invalid');
        return;
      }

      // Disable submit button to prevent multiple submissions and remove it after submit
      submitButton.disabled = true;
      submitButton.style.display = 'none';

      // Function to send form data to Voiceflow
      const submitFormData = (fileUrl) => {
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: {
            email: emailInput.value,
            topic: topicInput.value,
            userQuestion: userQuestionInput.value,
            file: fileUrl || null,
          },
        });

        // Re-enable the chat input after submission
        disableInput(false);
      };

      // If a file is selected, upload it first
      if (selectedFile) {
        uploadStatusDiv.innerHTML = `
          <img src="https://s3.amazonaws.com/com.voiceflow.studio/share/upload/upload.gif"
               alt="Uploading" width="50" height="50">
        `;

        var data = new FormData();
        data.append('file', selectedFile);

        fetch('https://tmpfiles.org/api/v1/upload', {
          method: 'POST',
          body: data,
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Upload failed: ' + response.statusText);
            }
          })
          .then((result) => {
            uploadStatusDiv.innerHTML = ''; // Clear the upload status after submission
            fileUrl = result.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
            // Submit the form data with file URL
            submitFormData(fileUrl);
          })
          .catch((error) => {
            console.error(error);
            uploadStatusDiv.innerHTML = '<div>Error during file upload</div>';
            // Submit the form data without file URL
            submitFormData(null);
          });
      } else {
        // No file selected, submit the form data directly
        submitFormData(null);
      }
    });

    element.appendChild(formContainer);
  },
};

export const HubSpotFormExtension = {
  name: 'HubSpotForm',
  type: 'response',
  match: ({ trace }) => trace.type === 'hubspot_form' || trace.payload.name === 'hubspot_form',
  render: ({ trace, element }) => {
    console.log('Rendering HubSpot form...');

    // Create a container for the HubSpot form
    const formContainer = document.createElement('div');
    formContainer.id = 'hubspot-form-container';

    // Append the container to the chat widget element
    element.appendChild(formContainer);

    // Inject the HubSpot form script and initialize the form
    const script = document.createElement('script');
    script.charset = 'utf-8';
    script.type = 'text/javascript';
    script.src = '//js-eu1.hsforms.net/forms/embed/v2.js';

    script.onload = () => {
      console.log('HubSpot script loaded, initializing form...');
      hbspt.forms.create({
        portalId: '145343433',
        formId: '1823b491-d507-414a-8e43-55396faa652a',
        target: '#hubspot-form-container'
      });
    };

    script.onerror = () => {
      console.error('Failed to load HubSpot script.');
    };

    document.body.appendChild(script);

    console.log('HubSpot form script appended to document.');
  }
};





window.voiceflowExtensions = [
    VideoExtension,
    DisableInputExtension,
    FileUploadExtension,
    FormExtension,
    HubSpotFormExtension
];
