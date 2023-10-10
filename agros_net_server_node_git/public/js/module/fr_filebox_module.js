export default class ExcdFilebox {
    #dt = new DataTransfer();

    constructor($fileboxEl, name, filter, $infoCount) {
        this.$el = $fileboxEl;
        this.inputName = name;
        this.inputId = name + '-id';
        this.addBtnId = name + '-addBtnId';
        this.addFolerBtnId = name + '-addFolderBtnId';
        this.rmBtnId = name + '-rmAllBtnId';
        this.filter = filter;
        this.$infoCount = $infoCount;
        this.totalLen = 0;
        this.totalSize = 0;
    }

    init() {
        // console.log('ExcdFileBox init() - name :  ' + this.inputName + ', inputId: ' + this.inputId
            // + ', addBtnId : ' + this.addBtnId + ', rmBtnId : ' + this.rmBtnId + ', filter : ' + this.filter + ', dt : ' + this.#dt);

        this.#addComponent();
        this.#initBtns();
        this.#initInput();

    }

    #addComponent() {
        const fileCount = `<div class="file-box-count display-none">total : 0</>`
        const input = `<input type="file" name="${this.inputName}" id="${this.inputId}" accept="${this.filter}" class="display-none" multiple>`;
        const fileBtns =
            `<div class="contents-column file-btns"> \
                <button class="excd-btn excd-btn-small excd-btn-color-third" type="button" id="${this.addBtnId}"><i class="fas fa-file"></i> 파일추가</button> \
                <button class="excd-btn excd-btn-small excd-btn-color-gray display-none" type="button" id="${this.rmBtnId}"><i class="fas fa-trash"></i> 전체삭제</button> \
            </div>`;
                // <button class="excd-btn excd-btn-small excd-btn-color-yellow" type="button" id="${this.addFolerBtnId}"><i class="fas fa-folder-open"></i> 폴더추가</button> \
                

        this.$el.append(fileCount);
        this.$el.append(input);

        // this.inputEl = $(input).appendTo(this.$el)[0];
        this.$el.after(fileBtns);
    }

    removeAllFiles() {
        return $(this.$el).find('.file-item-rmbtn').click();
    }

    getFileList() {
        return this.#dt.files;
    }

    #initBtns() {
        $(`#${this.addBtnId}`).on('click', () => {
            console.log('clicked');
            console.log('click() - ' + this.inputId);
            return $(`#${this.inputId}`).click();
        })

        $(`#${this.rmBtnId}`).on('click', () => {
            return this.removeAllFiles();
        })

    }

    #initInput() {
        $(`#${this.inputId}`).on('change', (e) => {
            console.log('file changed')
            var input = e.target;
            this.$el.removeClass('excd-filebox-empty');

            if (this.#dt.files.length + input.files.length >= 10) {
                this.$el.find('.file-item').not('.file-item-server').remove();
                this.$el.append(this.#getFilePackage(input.files));
            } else {
                for (var file of input.files) {
                    // console.dir(file);
                    this.$el.append(this.#getFileItem(file));
                    this.#dt.items.add(file);
                };
           }

            input.files = this.#dt.files;

            if (input.files.length > 0) {
                $('#' + this.rmBtnId).removeClass('display-none');
            } else {
                $('#' + this.rmBtnId).addClass('display-none');
            }

            // console.dir(this.#dt.files);
            // console.log('file length :' + this.#dt.files.length)
        })
    }

    #getFilePackage(files) {
        if (!files) {
            return null;
        }

        var fileName = files[0].name;
        var fileCount = this.#dt.files.length + files.length - 1;

        var $fileItem = $('<div class="file-item">');

        var className;
        for (var file of files) {
            className = this.#getFileItemClass(file);
            this.#dt.items.add(file);
        }

        $fileItem.addClass(className);


        $fileItem.append('<div class="file-item-icon"></div>');
        $fileItem.append('<div class="file-item-pkg"></div>');

        $fileItem.append(`<div class="file-item-name">${fileName} 외 ${fileCount}개</div>`);

        var $rmBtn = $('<div class="file-item-rmbtn"><i class="fas fa-times-circle"></i></div>');

        $rmBtn.on('click', (e) => {
            console.log('remove clicked!');
            var name = $rmBtn.prev('.file-item-name').text();
            console.log('name : ' + name);
            $rmBtn.parent().remove();

            this.#dt.clearData();

            this.$el.addClass('excd-filebox-empty');
            $('#' + this.rmBtnId).addClass('display-none');

            document.getElementById(this.inputId).files = this.#dt.files;
        })
        $fileItem.append($rmBtn);

        return $fileItem

    }

    #getFileItem(file, isServerFile) {
        var $fileItem = $('<div class="file-item">');
        $fileItem.addClass(this.#getFileItemClass(file));

        $fileItem.append('<div class="file-item-icon"></div>');
        $fileItem.append(`<div class="file-item-name">${file.name}</div>`);

        
        if (isServerFile) {
            $fileItem.addClass('file-item-server');
            var $dnBtn = $('<div class="file-item-dnbtn"><i class="fas fa-download"></i></div>');
            $dnBtn.on('click', (e) => {
                var dataTy;
                var dataId;

                console.dir(file);
                
                if (this.inputName =='cam_file') {
                    dataTy = 'cam';
                    dataId = file.photo_id
                }else if (this.inputName =='lidar_file') {
                    dataTy = 'lidar';
                    dataId = file.las_id
                }else {
                    dataTy = 'meta';
                    dataId = file.meta_id
                }

                // if (file.data_ty_id ==1) {
                //     dataTy = 'cam';
                //     dataId = file.photo_id
                // }else if (file.data_ty_id ==2) {
                //     dataTy = 'lidar';
                //     dataId = file.las_id
                // }else {
                //     dataTy = 'meta';
                //     dataId = file.meta_id
                // }

                location.href = '/api/data/down/' + dataTy + '/' + dataId;
            });

            $fileItem.append($dnBtn);
            
        }else {
            var $rmBtn = $('<div class="file-item-rmbtn"><i class="fas fa-times-circle"></i></div>');

            $rmBtn.on('click', (e) => {
                console.log('remove clicked!');
                var name = $rmBtn.prev('.file-item-name').text();
                console.log('name : ' + name);
                $rmBtn.parent().remove();
    
                for (let i = 0; i < this.#dt.items.length; i++) {
                    if (name === this.#dt.items[i].getAsFile().name) {
                        this.#dt.items.remove(i);
                        continue;
                    }
                }
    
                if (this.#dt.items.length < 1) {
                    this.$el.addClass('excd-filebox-empty');
                    $('#' + this.rmBtnId).addClass('display-none');
                }
    
                document.getElementById(this.inputId).files = this.#dt.files;
            })
            $fileItem.append($rmBtn);
        }


        return $fileItem;
    }

    #getFileItemClass(file) {
        // console.dir(file)

        if (file.type == "application/x-zip-compressed" || 
            file.name.toLowerCase().endsWith('.zip')) {
            // file.data_ty_id == 4) {
            file.data_ty_id = 4;
            return 'file-item-zip';
        }

        if ((file.type && file.type.toLowerCase().startsWith('image/')) || 
            (file.name && file.name.toLowerCase().endsWith('.jpg') ||
            file.name.toLowerCase().endsWith('.jpeg') )) {
            // file.data_ty_id == 1) {
            file.data_ty_id = 1;
            return 'file-item-img';
        }

        if ((file.name && file.name.toLowerCase().endsWith('.las')) || 
            file.name.toLowerCase().endsWith('.laz') || 
            file.name.toLowerCase().endsWith('.rlf') || 
            file.name.toLowerCase().endsWith('.pcd')) {
            // file.data_ty_id == 2) {
            file.data_ty_id = 2;
            return 'file-item-las';
        }

        file.data_ty_id = 3;
        return 'file-item-meta';
    }

    getDataPackage(prjId, option) {
        if (!prjId) {
            return console.log('getDataPackage - invalid prjId : ' + prjId);
        }

        var param = null;

        if (option) {
            param = "page=" + option.page + 
                "&perPage=" + option.perPage;
        }

        // console.dir(this);   

        $.ajax({
            url: '/api/data/package/' + prjId + '/' + this.inputName,
            data: param,

            success: (result) => {
                console.dir(result)
                // console.dir(this)
                if (!result.success) {
                    return runToastr('error', result.msg);
                }

                if (option && option.pagination && result.data.length > 0) {
                    console.log('total : ' + result.data[0].total);
                    // option.pagination.setTotalItems(result.data[0].total);
                    option.pagination.reset(result.data[0].total);
                    
                    this.totalLen = result.data[0].total;
                    this.totalSize = Number(result.data[0].sum);
                }

                return this.#addServerFileItem(result.data);
                // runToastr('success', result.msg);
            },
            error: function (xhr, status, err) {
                console.log('getDataPackage - err!');
                console.dir(err);

            },
            complete: function () {
            }
        });
    }

    #addServerFileItem(fileList) {
        if (!fileList || fileList.length ==0) {
            return;
        }

        this.$el.find('.file-item').remove();
        this.$el.removeClass('excd-filebox-empty');
        
        if (fileList[0].total) {
            var $count = this.$el.find('.file-box-count');
            $count.html('파일 개수 : ' + fileList[0].total);
            $count.removeClass('display-none');
        }

        fileList.forEach((file) => {
            file.name = file.org_file_nm;
            this.$el.append(this.#getFileItem(file, true));
            // this.totalSize += Number(file.file_len);
        });

        this.#setFileCount();

    }

    #setFileCount() {
        // console.dir(fileList);
        
        if (this.$infoCount) {
            this.$infoCount.html(this.totalLen + '개 (전체 용량 : ' + formatterFileSize(this.totalSize) + ')');
        }

    }


}

