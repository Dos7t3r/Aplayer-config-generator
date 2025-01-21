// Toastr 配置
toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};

// 生成唯一ID函数
function generateUniqueId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 播放器列表初始化，包含一个随机生成ID的默认播放器
let players = [{ 
    id: `aplayer_${generateUniqueId()}`, 
    songName: '', 
    artist: '', 
    mp3Url: '', 
    coverUrl: '', 
    lrcType: 'url', 
    lrcContent: '' 
}];

// 创建播放器HTML
function createPlayerHTML(player, index) {
    return `
        <div class="mb-8 p-6 bg-gray-700 rounded-lg relative" data-player-id="${player.id}">
            <h2 class="text-xl font-semibold mb-4">播放器 ${index + 1}</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="songName-${player.id}" class="block text-sm font-medium mb-1 text-gray-300">歌曲名称 / Song Name</label>
                    <input type="text" id="songName-${player.id}" value="${player.songName}" class="w-full px-3 py-2 bg-gray-600 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">
                </div>
                <div>
                    <label for="artist-${player.id}" class="block text-sm font-medium mb-1 text-gray-300">艺术家 / Artist</label>
                    <input type="text" id="artist-${player.id}" value="${player.artist}" class="w-full px-3 py-2 bg-gray-600 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">
                </div>
            </div>
            
            <div class="mb-4">
                <label for="mp3Url-${player.id}" class="block text-sm font-medium mb-1 text-gray-300">MP3 URL</label>
                <input type="text" id="mp3Url-${player.id}" value="${player.mp3Url}" class="w-full px-3 py-2 bg-gray-600 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">
            </div>
            
            <div class="mb-4">
                <label for="coverUrl-${player.id}" class="block text-sm font-medium mb-1 text-gray-300">封面图片 URL / Cover URL</label>
                <input type="text" id="coverUrl-${player.id}" value="${player.coverUrl}" class="w-full px-3 py-2 bg-gray-600 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">
            </div>
            
            <div class="mb-4">
                <label class="block text-sm font-medium mb-2 text-gray-300">歌词类型 / Lyric Type</label>
                <div class="flex space-x-4">
                    <label class="inline-flex items-center">
                        <input type="radio" name="lrcType-${player.id}" value="url" ${player.lrcType === 'url'? 'checked' : ''} class="form-radio text-blue-500">
                        <span class="ml-2 text-gray-300">URL</span>
                    </label>
                    <label class="inline-flex items-center">
                        <input type="radio" name="lrcType-${player.id}" value="text" ${player.lrcType === 'text'? 'checked' : ''} class="form-radio text-blue-500">
                        <span class="ml-2 text-gray-300">手动输入 / Input manually</span>
                    </label>
                </div>
            </div>
            
            <div class="mb-4 lrc-content">
                <label for="lrcContent-${player.id}" class="block text-sm font-medium mb-1 text-gray-300">
                    ${player.lrcType === 'url'? '歌词 URL' : '歌词内容 / Lyric Contents'}
                </label>
                ${player.lrcType === 'url' 
                   ? `<input type="text" id="lrcContent-${player.id}" value="${player.lrcContent}" class="w-full px-3 py-2 bg-gray-600 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">`
                    : `<textarea id="lrcContent-${player.id}" rows="5" class="w-full px-3 py-2 bg-gray-600 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">${player.lrcContent}</textarea>`
                }
            </div>

            ${index > 0? `
                <button class="delete-player absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    删除
                </button>
            ` : ''}
        </div>
    `;
}

// 修正歌词时间戳
function correctLyrics(lyrics) {
    const lines = lyrics.split('\n');
    let correctionCount = 0;
    const correctedLines = lines.map(line => {
        if (line.trim() === '') return line;
        // 调整后的正则表达式，允许任意位数的毫秒数
        const hasTimestamp = /\[\d{2}:\d{2}\.\d+\]/.test(line);
        // 替换行中所有时间标签，确保毫秒为三位数
        let correctedLine = line.replace(/\[(\d{2}):(\d{2})\.(\d+)\]/g, (match, min, sec, ms) => {
            // 保留前三位毫秒数，不足三位则补零
            let paddedMs = ms.padEnd(3, '0').slice(0, 3);
            if (ms!== paddedMs) {
                correctionCount++;
            }
            return `[${min}:${sec}.${paddedMs}]`;
        });
        // 如果没有时间标签，则添加默认时间标签
        if (!hasTimestamp) {
            correctedLine = `[00:00.000]${correctedLine}`;
            correctionCount++;
        }
        return correctedLine;
    });
    return { correctedLyrics: correctedLines.join('\n'), correctionCount };
}

// 渲染播放器列表
function renderPlayers() {
    const container = document.getElementById('players-container');
    container.innerHTML = players.map((player, index) => createPlayerHTML(player, index)).join('');

    // 添加事件监听器
    players.forEach((player, index) => {
        const playerElement = container.querySelector(`[data-player-id="${player.id}"]`);
        
        // 歌词类型切换
        const lrcTypeRadios = playerElement.querySelectorAll(`input[name="lrcType-${player.id}"]`);
        lrcTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                player.lrcType = e.target.value;
                const lrcContentContainer = playerElement.querySelector('.lrc-content');
                lrcContentContainer.innerHTML = `
                    <label for="lrcContent-${player.id}" class="block text-sm font-medium mb-1 text-gray-300">
                        ${player.lrcType === 'url'? '歌词 URL' : '歌词内容 / Lyric Contents'}
                    </label>
                    ${player.lrcType === 'url' 
                       ? `<input type="text" id="lrcContent-${player.id}" value="${player.lrcContent}" class="w-full px-3 py-2 bg-gray-600 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">`
                        : `<textarea id="lrcContent-${player.id}" rows="5" class="w-full px-3 py-2 bg-gray-600 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">${player.lrcContent}</textarea>`
                    }
                `;
                if (player.lrcType === 'text') {
                    toastr.info('在文本区域失去焦点时，歌词时间标签将自动校正。', '提示');
                }
                addLyricsListener(playerElement, player.id);
            });
        });

        // 删除按钮
        if (index > 0) { // 第一个播放器不可删除
            const deleteButton = playerElement.querySelector('.delete-player');
            deleteButton.addEventListener('click', () => {
                const playerId = player.id; // 捕获播放器ID
                const hasContent = Object.values(player).some(value => value!== '' && value!== 'url');
                if (hasContent) {
                    if (confirm(`确定要删除播放器(id:${playerId})吗？此操作不可撤销。`)) {
                        players.splice(index, 1);
                        renderPlayers();
                        toastr.success(`播放器(id:${playerId})已删除。`, '删除成功');
                    }
                } else {
                    players.splice(index, 1);
                    renderPlayers();
                    toastr.success(`播放器(id:${playerId})已删除。`, '删除成功');
                }
            });
        }

        // 输入字段更新
        ['songName', 'artist', 'mp3Url', 'coverUrl'].forEach(field => {
            const input = playerElement.querySelector(`#${field}-${player.id}`);
            input.addEventListener('input', (e) => {
                player[field] = e.target.value;
            });
        });

        // 添加歌词监听
        addLyricsListener(playerElement, player.id);
    });
}

// 添加歌词监听器
function addLyricsListener(playerElement, playerId) {
    const lrcContentInput = playerElement.querySelector(`#lrcContent-${playerId}`);
    if (lrcContentInput) {
        lrcContentInput.addEventListener('blur', () => {
            const player = players.find(p => p.id === playerId);
            if (player && player.lrcType === 'text') {
                const { correctedLyrics, correctionCount } = correctLyrics(lrcContentInput.value);
                lrcContentInput.value = correctedLyrics;
                player.lrcContent = correctedLyrics;
                if (correctionCount > 0) {
                    toastr.success(`播放器(id:${playerId})已修正 ${correctionCount} 处歌词时间戳错误。`, '歌词修正');
                }
            } else if (player) {
                player.lrcContent = lrcContentInput.value;
            }
        });
    }
}

// 添加播放器按钮事件监听器
document.getElementById('add-player').addEventListener('click', () => {
    const newPlayerId = `aplayer_${generateUniqueId()}`;
    players.push({ 
        id: newPlayerId, 
        songName: '', 
        artist: '', 
        mp3Url: '', 
        coverUrl: '', 
        lrcType: 'url', 
        lrcContent: '' 
    });
    renderPlayers();
    toastr.success(`播放器(id:${newPlayerId})创建成功。`, '成功');
});

// CDN源切换事件监听器
document.getElementById('cdn-source').addEventListener('change', (e) => {
    const customCdnContainer = document.getElementById('custom-cdn-container');
    if (e.target.value === 'custom') {
        customCdnContainer.classList.remove('hidden');
    } else {
        customCdnContainer.classList.add('hidden');
    }
});

// 生成嵌入代码按钮事件监听器
document.getElementById('generate-code').addEventListener('click', () => {
    const cdnSource = document.getElementById('cdn-source').value;
    const customCdn = document.getElementById('custom-cdn').value;

    let cdnUrl;
    switch (cdnSource) {
        case 'jsdelivr':
            cdnUrl = 'https://cdn.jsdelivr.net/npm/aplayer/dist';
            break;
        case 'cdnjs':
            cdnUrl = 'https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1';
            break;
        case 'unpkg':
            cdnUrl = 'https://unpkg.com/aplayer/dist';
            break;
        case 'custom':
            cdnUrl = customCdn;
            break;
        default:
            cdnUrl = 'https://cdn.jsdelivr.net/npm/aplayer/dist';
    }

    // 生成唯一标识符，用于变量名的唯一性
    const uniqueCode = generateUniqueId(8);

    // 生成播放器代码
    const playerCodes = players.map(player => `
<div id="${player.id}"></div>
<script>
(function() {
    const container = document.getElementById('${player.id}');
    if (!container) return;
    const shadow = container.attachShadow({mode: 'open'});

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '${cdnUrl}/APlayer.min.css';
    shadow.appendChild(link);

    const playerDiv = document.createElement('div');
    playerDiv.id = '${player.id}_inner';
    shadow.appendChild(playerDiv);

    const script = document.createElement('script');
    script.src = '${cdnUrl}/APlayer.min.js';
    script.onload = function() {
        const ap_${uniqueCode}_${player.id} = new APlayer({
            container: playerDiv,
            audio: [
                {
                    name: '${player.songName}',
                    artist: '${player.artist}',
                    url: '${player.mp3Url}',
                    cover: '${player.coverUrl}',
                    lrc: \`${player.lrcContent}\`
                }
            ],
            lrcType: ${player.lrcType === 'url'? 3 : 1}
        });
    };
    shadow.appendChild(script);
})();
</script>
    `).join('\n');

    const code = `
<meta charset="UTF-8">
${playerCodes}
    `;

    const embedCodeTextarea = document.getElementById('embed-code');
    embedCodeTextarea.value = code;
    document.getElementById('embed-code-container').classList.remove('hidden');
    document.getElementById('copy-code').classList.remove('hidden');


    // Toastr 成功通知
    toastr.success('嵌入代码生成成功。', '生成成功');
});

// 复制嵌入代码按钮事件监听器
document.getElementById('copy-code').addEventListener('click', () => {
    const embedCode = document.getElementById('embed-code').value;
    navigator.clipboard.writeText(embedCode).then(() => {
        toastr.success('嵌入代码已复制到剪贴板。', '复制成功');
    }, (err) => {
        console.error('无法复制文本 / Unable to copy text: ', err);
        toastr.error('无法自动复制代码，请手动复制嵌入代码。', '复制失败');
    });
});

// 初始化渲染播放器列表
renderPlayers();