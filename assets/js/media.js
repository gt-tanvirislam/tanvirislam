/* Link parser: understands YouTube, Google Drive, Cloudinary, Vimeo and direct files */
(function (w) {
  'use strict';
  function ratio(s) {
    if (!s || s === 'auto') return null;
    var p = String(s).split(/[:\/x]/), a = parseFloat(p[0]), b = parseFloat(p[1]);
    return a && b ? a / b : null;
  }
  function cldImg(u, t) {
    return /\/upload\/[^/]*f_auto/.test(u) ? u : u.replace('/upload/', '/upload/' + t + '/');
  }
  function parse(url) {
    var u = String(url || '').trim();
    if (!u) return null;
    var m;
    m = u.match(/(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (m) {
      var short = /youtube\.com\/shorts\//.test(u);
      return { kind: 'youtube', id: m[1], embed: 'https://www.youtube-nocookie.com/embed/' + m[1] + '?rel=0&modestbranding=1&playsinline=1',
               thumb: 'https://i.ytimg.com/vi/' + m[1] + '/hqdefault.jpg', aspect: short ? '9:16' : '16:9', video: true };
    }
    m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return { kind: 'vimeo', id: m[1], embed: 'https://player.vimeo.com/video/' + m[1], thumb: '', aspect: '16:9', video: true };
    m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([A-Za-z0-9_-]+)/);
    if (m) return { kind: 'drive', id: m[1], embed: 'https://drive.google.com/file/d/' + m[1] + '/preview',
                    thumb: 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w1000', aspect: '16:9', video: true };
    if (/res\.cloudinary\.com\/[^/]+\/video\/upload\//.test(u)) {
      return { kind: 'video', src: u.replace('/video/upload/', '/video/upload/q_auto/'),
               thumb: u.replace('/video/upload/', '/video/upload/so_0,w_900,c_limit,f_jpg/').replace(/\.(mp4|mov|webm|m4v)(\?.*)?$/i, '.jpg'),
               aspect: '16:9', video: true };
    }
    if (/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(u)) {
      return { kind: 'image', src: cldImg(u, 'f_auto,q_auto,w_2000,c_limit'), thumb: cldImg(u, 'f_auto,q_auto,w_900,c_limit'), aspect: 'auto', video: false };
    }
    if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u)) return { kind: 'video', src: u, thumb: '', aspect: '16:9', video: true };
    return { kind: 'image', src: u, thumb: u, aspect: 'auto', video: false };
  }
  w.TSMedia = { parse: parse, ratio: ratio };
})(window);
