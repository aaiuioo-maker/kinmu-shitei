#!/usr/bin/env python3
"""キャラクターの動き 確認アプリ（ugoki-app.html）で、1個 えらんだ ときに 読み上げる 声を 作るスクリプト。

動き 1個ごとに、18人の 読み手から 1人を ランダムに 決めて（いつも 同じ 人に なるよう 決まった 種で）、
「名前。説明」を 読む 声を koe-ugoki/<グループ>/<番号>.mp3 に 作る。
できた ものの 一覧（だれが 読むか・どの 文を 読んだか）は koe-ugoki/yomite.json に 書く。

動きの 一覧 ugoki_list.json（[{g, no, name, desc}, ...]）は、index.html の CC_EXTRA から 取りだした もの。

  python koe_tsukuru.py ugoki_list.json                 # 全部 作る（もう あるものは 作らない）
  python koe_tsukuru.py ugoki_list.json tana/301 mc/1   # その 動きだけ
  python koe_tsukuru.py ugoki_list.json --yarinaoshi    # 全部 作り直す

文が 変わった 動き（名前・説明を 直したもの）は、yomite.json の 印が 合わないので 作り直す。
エンジン：VOICEVOX 50021・AivisSpeech 10101・COEIROINK 50032（v2）。音量は sandai-genso/omakase の 同じ人の 声に そろえる。
"""
import json, os, random, re, subprocess, sys, tempfile, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.environ.get('REF') or r'C:\Users\aaiui\ccwork\sandai-genso\omakase'   # 音量の 見本
URL = {'VOICEVOX': 'http://127.0.0.1:50021', 'AivisSpeech': 'http://127.0.0.1:10101', 'COEIROINK': 'http://127.0.0.1:50032'}

# [フォルダ, エンジン, エンジンでの名前, 声の種類]（sandai-genso の 動画と 同じ 18人）
VOICES = [
    ['koe', 'VOICEVOX', '四国めたん', 'ノーマル'],
    ['koe-tsumugi', 'VOICEVOX', '春日部つむぎ', 'ノーマル'],
    ['koe-hau', 'VOICEVOX', '雨晴はう', 'ノーマル'],
    ['koe-sayo', 'VOICEVOX', '小夜/SAYO', 'ノーマル'],
    ['koe-himari', 'VOICEVOX', '冥鳴ひまり', 'ノーマル'],
    ['koe-nurserobo', 'VOICEVOX', 'ナースロボ＿タイプＴ', 'ノーマル'],
    ['koe-tsukuyomi', 'COEIROINK', 'つくよみちゃん', 'れいせい'],
    ['koe-mana', 'COEIROINK', 'MANA', 'のーまる'],
    ['koe-kana', 'COEIROINK', 'KANA', 'のーまる'],
    ['koe-ameno-kuma', 'COEIROINK', 'アメノちゃん', '熊本弁'],
    ['koe-lilin', 'COEIROINK', 'リリンちゃん', 'のーまる'],
    ['koe-mao', 'AivisSpeech', 'まお', 'ノーマル'],
    ['koe-mai', 'AivisSpeech', 'まい', 'ノーマル'],
    ['koe-kohaku', 'AivisSpeech', 'コハク', 'ノーマル'],
    ['koe-chuni', 'AivisSpeech', '中2', 'ノーマル'],
    ['koe-runa', 'AivisSpeech', 'るな', 'ノーマル'],
    ['koe-kanon', 'AivisSpeech', '花音', 'ノーマル'],
    ['koe-sakurane', 'AivisSpeech', '桜音', 'ノーマル'],
]

# 読みまちがえやすい ことば → 読みかた（長い ものから 先に 置きかえる）
YOMI = {
    '御神体様御奉斎': 'ごしんたいさま ごほうさい', '慰霊祭': 'いれいさい', '天津祝詞': 'あまつのりと', '善言讃詞': 'ぜんげんさんし',
    '神人合一': 'しんじんごういつ', '降誕': 'こうたん', '夜昼転換': 'よるひるてんかん', '観世音菩薩': 'かんぜおんぼさつ',
    '霊体一致': 'れいたいいっち', '咎むる勿れ': 'とがむるなかれ', '御任せ': 'おまかせ', '三尊の弥陀': 'さんぞんのみだ',
    '我と執着': 'がとしゅうちゃく', '想念次第': 'そうねんしだい', '主の字': 'しゅのじ', '観音力': 'かんのんりき',
    '本医術': 'ほんいじゅつ', '再浄化': 'さいじょうか', '三毒': 'さんどく', '東方の光': 'とうほうのひかり', '薬毒': 'やくどく',
    '安心立命': 'あんしんりつめい', '霊線': 'れいせん', '九分九厘': 'くぶくりん', '行詰り': 'ゆきづまり', '醍醐味': 'だいごみ',
    '観音心': 'かんのんしん', '昼夜の転換': 'ちゅうやのてんかん', '先駆け': 'さきがけ', '大和民族美術館': 'やまとみんぞく びじゅつかん',
    '組立工場': 'くみたてこうじょう', '立春祭': 'りっしゅんさい', '地上天国祭': 'ちじょうてんごくさい', '三大元素': 'さんだいげんそ',
    '真善美': 'しんぜんび', '時期を待て': 'じきをまて', '浄化作用': 'じょうかさよう', '化身': 'けしん', '三大迷信': 'さんだいめいしん',
    '狩野英孝': 'かのえいこう', '押忍': 'おす', '虎咬拳': 'ここうけん', '守護神': 'しゅごじん', '評判と感情': 'ひょうばんとかんじょう',
    '幸福の秘訣': 'こうふくのひけつ', '日と月': 'ひとつき', 'TNT': 'ティーエヌティー',
}
HEAD = {'程': 'ほど'}   # 名前の 頭（：の 前）だけで 読みを かえる もの


def h32(s):
    """文の 印（アプリの JavaScript と 同じ 計算：FNV-1a、UTF-16 の 文字ごと）"""
    h = 0x811c9dc5
    b = s.encode('utf-16-le')
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xffffffff
    return format(h, '08x')


def yomi(m):
    name = m['name']
    if '：' in name:
        a, b = name.split('：', 1)
        name = HEAD.get(a, a) + '。' + b
    t = name + '。' + (m.get('desc') or '')
    for k in sorted(YOMI, key=len, reverse=True):
        t = t.replace(k, YOMI[k])
    t = re.sub(r'[一-龥々〇]+[（(]([ぁ-ゖー]+)[）)]', r'\1', t)   # 漢字（よみがな）は よみがなだけ 読む
    t = re.sub(r'[（(]', '、', t)
    t = re.sub(r'[）)]', '、', t)
    t = t.replace('・', '、')
    t = re.sub(r'、+([。！？…])', r'\1', t)
    t = re.sub(r'、{2,}', '、', t).strip('、')
    return t


def get(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return r.read()


def post(url, body=None, ctype='application/json'):
    req = urllib.request.Request(url, data=body if body is not None else b'', method='POST', headers={'Content-Type': ctype})
    with urllib.request.urlopen(req, timeout=600) as r:
        return r.read()


def find_style(speakers, name, style, name_key, styles_key, id_key):
    cands = [s for s in speakers if s[name_key] == name] or [s for s in speakers if s[name_key].startswith(name) or name in s[name_key]]
    if not cands:
        return None
    for s in cands:
        for st in s[styles_key]:
            if st.get('styleName', st.get('name')) == style:
                return s, st[id_key]
    return cands[0], cands[0][styles_key][0][id_key]


def synth_vv(base, sid, text):
    q = post(base + '/audio_query?' + urllib.parse.urlencode({'text': text, 'speaker': sid}))
    return post(base + '/synthesis?' + urllib.parse.urlencode({'speaker': sid}), q)


def synth_coe(base, spk, sid, text):
    body = {'speakerUuid': spk['speakerUuid'], 'styleId': sid, 'text': text, 'speedScale': 1.0, 'volumeScale': 1.0,
            'pitchScale': 0.0, 'intonationScale': 1.0, 'prePhonemeLength': 0.1, 'postPhonemeLength': 0.3, 'outputSamplingRate': 24000}
    return post(base + '/v1/synthesis', json.dumps(body).encode())


def mean_db(path):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
    m = re.search(r'mean_volume: (-?[\d.]+) dB', out)
    return float(m.group(1)) if m else None


_ref = {}
def ref_db(folder):
    if folder not in _ref:
        d = os.path.join(REF, folder)
        vals = [v for v in (mean_db(os.path.join(d, f)) for f in sorted(os.listdir(d)) if f.endswith('.mp3'))] if os.path.isdir(d) else []
        vals = [v for v in vals if v is not None]
        _ref[folder] = sum(vals) / len(vals) if vals else None
    return _ref[folder]


def main():
    args = sys.argv[1:]
    L = json.load(open(args[0], encoding='utf-8'))
    redo = '--yarinaoshi' in args
    only = set(a for a in args[1:] if not a.startswith('--'))
    # 読み手を 決める：18人が だいたい 同じ 数に なるよう まぜて 配る（種が 決まって いるので 何度 やっても 同じ）
    keys = [f"{m['g']}/{m['no']}" for m in L]
    rng = random.Random(20261211)
    pool = []
    while len(pool) < len(keys):
        bag = [v[0] for v in VOICES]
        rng.shuffle(bag)
        pool += bag
    who = dict(zip(keys, pool))

    jpath = os.path.join(HERE, 'yomite.json')
    done = json.load(open(jpath, encoding='utf-8')) if os.path.exists(jpath) else {}

    engines = {}
    for eng, base in URL.items():
        try:
            engines[eng] = json.loads(get(base + ('/v1/speakers' if eng == 'COEIROINK' else '/speakers')))
            print(f'{eng}: つながった', flush=True)
        except Exception:
            print(f'{eng}: つながらないので その人の 声は とばす', flush=True)
    vinfo = {v[0]: v for v in VOICES}
    hits = {}
    made = skip = 0
    for m, key in zip(L, keys):
        if only and key not in only:
            continue
        folder = who[key]
        mark = h32(m['name'] + '\n' + (m.get('desc') or ''))
        out = os.path.join(HERE, m['g'], f"{m['no']}.mp3")
        if not redo and os.path.exists(out) and done.get(key) == [folder, mark]:
            continue
        _, eng, name, style = vinfo[folder]
        if eng not in engines:
            skip += 1
            continue
        if folder not in hits:
            hits[folder] = find_style(engines[eng], name, style, 'speakerName' if eng == 'COEIROINK' else 'name', 'styles', 'styleId' if eng == 'COEIROINK' else 'id')
        if not hits[folder]:
            skip += 1
            continue
        spk, sid = hits[folder]
        text = yomi(m)
        wav = synth_coe(URL[eng], spk, sid, text) if eng == 'COEIROINK' else synth_vv(URL[eng], sid, text)
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            f.write(wav)
            tmp = f.name
        gain, target, now = 0.0, ref_db(folder), mean_db(tmp)
        if target is not None and now is not None:
            gain = target - now
        os.makedirs(os.path.dirname(out), exist_ok=True)
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', tmp, '-af', f'volume={gain:.1f}dB',
                        '-ac', '1', '-ar', '24000', '-b:a', '32k', out], check=True)
        os.unlink(tmp)
        done[key] = [folder, mark]
        made += 1
        if made % 50 == 0:
            json.dump(done, open(jpath, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'), sort_keys=True)
            print(f'  {made}個 できた（いま {key}）', flush=True)
    # ファイルが ある ものだけ 一覧に 残す
    done = {k: v for k, v in done.items() if os.path.exists(os.path.join(HERE, k + '.mp3'))}
    json.dump(done, open(jpath, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'), sort_keys=True)
    print(f'作った：{made}個　とばした：{skip}個　一覧：{len(done)}個', flush=True)


if __name__ == '__main__':
    main()
