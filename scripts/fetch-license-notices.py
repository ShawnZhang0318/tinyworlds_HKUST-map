"""Explicit maintenance helper: refresh standard license copies and the provider's complete NOTICE."""
from html.parser import HTMLParser
from pathlib import Path
import shutil
import urllib.request

ROOT=Path(__file__).resolve().parent.parent
class PlainText(HTMLParser):
    def __init__(self):
        super().__init__();self.parts=[]
    def handle_data(self,data):
        self.parts.append(data)

def fetch(url):
    with urllib.request.urlopen(url,timeout=45) as response:
        return response.read().decode('utf-8')

if __name__=='__main__':
    dest=ROOT/'LICENSES';dest.mkdir(exist_ok=True)
    for name in ['ODbL-1.0','CC-BY-4.0','CDLA-Permissive-2.0','Apache-2.0','CC0-1.0']:
        text=fetch(f'https://raw.githubusercontent.com/spdx/license-list-data/main/text/{name}.txt')
        (dest/f'{name}.txt').write_text(text,encoding='utf-8')
    shutil.copyfile(ROOT/'vendor/tinyworlds-pipeline/LICENSE',dest/'tinyworlds-MIT.txt')
    parser=PlainText();parser.feed(fetch('https://opensource.foursquare.com/places-notice-txt/'))
    text='\n'.join(p.strip() for p in parser.parts if p.strip())
    start=text.find('Foursquare Labs, Inc. All rights reserved.')
    end=text.find('Data for future releases for yourself and others.',start)
    if start<0 or end<0:
        raise ValueError('Provider NOTICE page structure changed; inspect it before updating.')
    # Include the entire copyright line preceding the matched company name.
    start=text.rfind('\n',0,start)+1
    notice=text[start:end+len('Data for future releases for yourself and others.')]
    (dest/'Foursquare-OS-Places-NOTICE.txt').write_text(notice+'\n',encoding='utf-8')
    print('Updated license copies and complete Foursquare NOTICE. Review the diff before committing.')
