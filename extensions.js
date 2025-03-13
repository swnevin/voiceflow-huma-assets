// Extension 1: VideoExtension
const VideoExtension = {
  name: 'Video',
  type: 'response',
  match: () => {},
  render: () => {},
};

// Extension 2: DisableInputExtension
const DisableInputExtension = {
  name: 'DisableInput',
  type: 'effect',
  match: () => {},
  effect: () => {},
};

// Extension 3: FileUploadExtension
const FileUploadExtension = {
  name: 'FileUpload',
  type: 'response',
  match: () => {},
  render: () => {},
};

// Extension 4: FormExtension
const FormExtension = {
  name: 'Forms',
  type: 'response',
  match: () => {},
  render: () => {},
};

window.voiceflowExtensions = [
  VideoExtension,
  DisableInputExtension,
  FileUploadExtension,
  FormExtension
];
