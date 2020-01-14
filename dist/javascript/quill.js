class ImageUploader {
  constructor(quill, options) {
    this.quill = quill;
    this.options = options;
    this.range = null;

    var toolbar = this.quill.getModule("toolbar");
    toolbar.addHandler("image", this.selectLocalImage.bind(this));
  }

  selectLocalImage() {
    const input = document.createElement("input");

    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();

      formData.append("image", file);

      // Save current cursor state
      const range = this.quill.getSelection(true);

      // Insert temporary loading placeholder image
      this.quill.insertEmbed(
        range.index,
        "image",
        `https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif`
      );

      // Move cursor to right side of image (easier to continue typing)
      this.quill.setSelection(range.index + 1);

      const response = await postData("/images/upload", formData); // API post, returns image location as string e.g. 'http://www.example.com/images/foo.png'

      if (response.status === "error") {
        this.quill.deleteText(range.index, 1);
        const alertList = document.getElementsByClassName("alert-list")[0];
        createAlert(alertList, response.message, "alert--wrong");
        throw Error(response.message);
      }

      // Remove placeholder image
      this.quill.deleteText(range.index, 1);

      // Insert uploaded image
      this.quill.insertEmbed(range.index, "image", response.data);
    };
  }
}

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

const quillOptions = {
  theme: "snow",
  modules: {
    clipboard: { matchVisual: false },
    toolbar: {
      container: toolbarOptions
    },
    imageUploader: true
  }
};

export { quillOptions };
