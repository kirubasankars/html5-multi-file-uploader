
(function (scope) {

    //var $ = jQuery.noConflict();

    function mfUpload(config) {

        if (config.uploadBtn != false) {
            config.uploadBtn = true;
        }
        config.text = config.text || "Choose Files";
        config.nofilestext = config.nofilestext || "No file chosen";

        config.itemTemplate = config.itemTemplate || function (file) {
            return "<div class='fileItem'><a class='remove' style='cursor:pointer;color:red'>[x]</a><span>" + file.name + "</span></div>";
        };

        config.allow = config.allow || '';

        var uploaderTemplate = "<div><button class='choose' type='button'>" + config.text + "</button><input type='file' style='display:none' multiple accept='" + config.accept + "'/>" + (config.uploadBtn == true ? "<button class='upload' type='submit'>Upload</button>" : "") + "</div>",
            noFilesTemplate = "<div class='nofiles'>" + config.nofilestext + "</div>",
            uploadFolder = {}, uploader = config.el,
            noOfUploader = 0, noOfFiles = 0;

        uploader.append("<form>" +
                            "<div class='fileUploader'></div>" +
                            "<div class='fileList'></div>" +
                        "</form>");

        var fileUploader = $('.fileUploader', uploader),
            fileList = $('.fileList', uploader);

        fileUploader.append(uploaderTemplate);

        renderFileList();

        $('form', uploader).on('submit', function (event) {
            upload(config.extra || {});
            event.preventDefault();
        });

        uploader.on('click', 'button.choose', function (event) {
            event.preventDefault();
            var $this = $(this);
            $this.next().click();
        });

        uploader.on('click', '.remove', function (event) {
            event.preventDefault();
            var $this = $(this), id = $this.parent().parent().data('id');
            delete uploadFolder[id];
            $this.parent().remove();
            noOfFiles--;

            if (noOfFiles <= 0) {
                fileList.append(noFilesTemplate);
            }
        });

        uploader.on('change', '[type=file]', function () {
            var $this = $(this), file, id, i = 0;

            if (config.maxFileCount) {
                if ((this.files.length + noOfFiles) > config.maxFileCount) {
                    if (config.validation) {
                        config.validation("You can't upload more then " + config.maxFileCount + " files");
                    }
                    return;
                }
            }

            $this.attr('name', 'files').parent().hide();
            fileUploader.append(uploaderTemplate);
          
            for (; i < this.files.length; i++) {
                file = this.files[i];
                id = noOfUploader + '-' + file.name;
                uploadFolder[id] = file;
                noOfFiles++;
            }

            renderFileList()
            noOfUploader++;
        });

        function renderFileList() {
            var i = 0, file, key, filesKeys = Object.keys(uploadFolder);
            fileList.empty();
            for (; i < filesKeys.length; i++) {
                key = filesKeys[i];
                file = uploadFolder[key];

                fileList.append("<div data-id='" + key + "'>" + config.itemTemplate(file) + "</div>")
            }

            if (noOfFiles > 0) {
                $('.nofiles', fileList).remove();
            } else {
                fileList.append(noFilesTemplate);
            }
        }

        function upload(extra, done, error, always) {
            var formData = new FormData(), key, file, i = 0,
                keys = Object.keys(uploadFolder), dfd = jQuery.Deferred();;

            for (; i < keys.length; i++) {
                key = keys[i];
                file = uploadFolder[key];
                formData.append('files', file, file.name);
            }

            keys = Object.keys(extra);

            for (i = 0; i < keys.length; i++) {
                key = keys[i];
                e = extra[key];
                formData.append(key, e);
            }

            var request = new XMLHttpRequest();
            request.open("POST", config.url);
            request.send(formData);

            request.onload = function () {
                if (request.status === 200) {
                    dfd.resolve(request);
                } else {
                    dfd.reject(request);
                }
                dfd.always();
            };

            return dfd.promise();
        }

        function reset() {
            uploadFolder = {};
            noOfUploader = 0;
            noOfFiles = 0;
            renderFileList();
        }

        return {
            upload: upload,
            reset: reset
        }
    }

    scope.fn.mfUpload = function (config) {
        config.el = this;
        return mfUpload(config);
    };

})(jQuery);

