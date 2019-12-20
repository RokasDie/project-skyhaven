import { ImageUploader } from "/javascript/quillSetup/imageUploader.js";

Quill.register("modules/imageUploader", ImageUploader);

const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ list: "ordered" }, { list: "bullet" }],

  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme

  [{ align: [] }],

  ["clean"], // remove formatting button
  ["link"],
  ["image"]
];

var quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    toolbar: {
      container: toolbarOptions
    },
    imageUploader: true
  }
});
export { quill };
