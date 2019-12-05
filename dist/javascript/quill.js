import { ImageUploader } from "/javascript/quillSetup/imageUploader.js";
import { LoadingImage } from "/javascript/quillSetup/loadingImage.js";

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
    imageUploader: {
      upload: async file => {
        const formData = new FormData();
        formData.append("image", file);
        const response = await postData("/images/upload", formData);
        if (response.status === "error") {
          const alertList = document.getElementsByClassName("alert-list")[0];
          createAlert(alertList, response.message, "alert--wrong");
          throw Error(response.message);
        } else {
          return response.data;
        }
        //     imageUploader: {
        //         upload: file => {
        //           return new Promise((resolve, reject) => {
        //             const fd = new FormData();
        //             fd.append("image", file);
        //             const xhr = new XMLHttpRequest();
        //             xhr.open("POST", "/images/upload");
        //             xhr.onload = () => {
        //               if (xhr.status === 200) {
        //                 const url = JSON.parse(xhr.responseText).data;
        //                 resolve(url);
        //               }
        //             };
        //             xhr.send(fd);
        //           });
        //         }
        //   }
      }
    }
  }
});
export { ImageUploader, LoadingImage, quill };
