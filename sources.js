/* Sources tab: places that publish transcripts you can copy. Edit SOURCES to add your own. */
window.SOURCES = [
  { name: 'VOA Learning English', kind: 'News & stories', level: 'A2 to B1', tint: 'sage', url: 'https://learningenglish.voanews.com/',
    desc: 'Slow, clear news and stories written for learners. The text is on the page, and many lessons also have a YouTube version.',
    how: 'Open a story, copy the text, then add the matching YouTube video (search the title on YouTube).' },
  { name: 'BBC Learning English', kind: 'Lessons & dialogues', level: 'B1 to B2', tint: 'blue', url: 'https://www.bbc.co.uk/learningenglish/',
    desc: '6 Minute English and other short episodes. Each episode page shows a transcript. Accents are mostly British.',
    how: 'Copy the transcript from the episode page. The BBC also posts many episodes on YouTube.' },
  { name: 'TED Talks', kind: 'Talks', level: 'B2 to C1', tint: 'pink', url: 'https://www.ted.com/talks',
    desc: 'Talks on every topic. Open a talk, switch to the Transcript tab, and copy it with its timestamps.',
    how: 'Use the talk\'s YouTube link from the TED channel with the transcript from ted.com.' },
  { name: 'ELLLO', kind: 'Interviews', level: 'A1 to B2', tint: 'coral', url: 'https://elllo.org/',
    desc: 'Short conversations with speakers from many countries. Each one comes with a transcript.',
    how: 'Copy the transcript and practice in voice mode, or find the clip on YouTube for real audio.' },
  { name: 'NPR', kind: 'News & interviews', level: 'B2 to C1', tint: 'olive', url: 'https://www.npr.org/',
    desc: 'Natural American speech. Many stories have a transcript link under the audio player.',
    how: 'Open a story, choose Transcript, copy the text.' },
  { name: 'LibriVox and Project Gutenberg', kind: 'Audiobooks', level: 'Varies', tint: 'sage', url: 'https://librivox.org/',
    desc: 'Free audiobooks read by volunteers, and the same books as text on gutenberg.org.',
    how: 'Copy a chapter from Project Gutenberg and use voice mode, or find the reading on YouTube.' },
  { name: 'easyenglish551', kind: 'YouTube channel', level: 'Your pick', tint: 'blue', url: 'https://www.youtube.com/@easyenglish551',
    desc: 'The channel you picked earlier. Check that a video has captions: turn on CC in YouTube, or look for Show transcript.',
    how: 'If it has captions, download them with yt-dlp (see below) and upload the file.' },
];

(() => {
  const L = window.L, esc = L.esc;
  L.views.sources = () => `<p class="brand">Sources</p><h1>Find something to listen to</h1>
    <p class="muted">These sites publish the text of what is said, so you can copy it. Open one, copy the text, then tap <b>Add a video</b>.</p>
    <div class="card cheer-card small"><b>Easiest workflow</b>
      <ol style="margin:6px 0 0;padding-left:20px"><li>Pick a lesson below and copy its text.</li><li>Find the same lesson on YouTube and copy its link.</li><li>Add a video: paste both. The video plays each line.</li></ol>
      <p style="margin:8px 0 0">No YouTube version? Paste only the text and your phone reads the lines aloud.</p></div>
    ${window.SOURCES.map(s => `<div class="src t-${s.tint}"><div class="row"><b class="grow sname">${esc(s.name)}</b></div>
      <div class="chips" style="margin:6px 0"><span class="pillchip" style="background:rgba(255,255,255,.5)">${esc(s.kind)}</span><span class="pillchip" style="background:rgba(255,255,255,.5)">${esc(s.level)}</span></div>
      <p style="margin:6px 0">${esc(s.desc)}</p><p class="small" style="margin:0 0 10px;opacity:.85"><b>How:</b> ${esc(s.how)}</p>
      <a class="btn sm" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="width:auto;display:inline-flex">Open site ↗</a></div>`).join('')}
    <h2 class="display">Videos with captions</h2>
    <div class="card small"><p style="margin:0 0 8px">Can't copy a YouTube transcript? On a computer, <code>yt-dlp</code> can save the captions to a file, and the Add screen accepts <b>.vtt</b> and <b>.srt</b> files:</p>
      <pre class="cmd">yt-dlp --skip-download --write-auto-subs --sub-langs "en.*" --sub-format vtt "VIDEO_LINK"</pre>
      <p class="muted" style="margin:8px 0 0">Tools:
        <a href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noopener noreferrer">yt-dlp ↗</a> ·
        <a href="https://www.languagereactor.com/" target="_blank" rel="noopener noreferrer">Language Reactor ↗</a></p></div>
    <p class="muted small">Check each site's terms. Use transcripts for your own study.</p>`;
})();
