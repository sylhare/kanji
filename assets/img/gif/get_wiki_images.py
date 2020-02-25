#!/usr/bin/env python
# -*- coding: utf-8 -*-
import re
import time
import urllib

import requests

regex = "\/\/[\w/\-?=%.]+(-order.gif/)"
wiki_url = "https://en.wiktionary.org/wiki/{}#/media/File:{}-order.gif/"
kanjis = ["", "一", "丨", "丶", "丿", "乙", "亅", "二", "亠", "人", "儿", "⼊", "八", "冂", "冖", "冫", "几", "凵", "刀", "力", "勹", "匕",
          "匚", "匸", "十", "卜", "卩", "厂", "厶", "又", "口", "囗", "土", "士", "夂", "夊", "夕", "大", "女", "子", "宀", "寸", "小", "尢",
          "尸", "屮", "山", "巛", "工", "已", "巾", "干", "幺", "广", "廴", "廾", "弋", "弓", "彐", "彡", "彳", "心", "戈", "戸", "手", "支",
          "攵", "文", "斗", "斤", "方", "无", "日", "曰", "月", "木", "欠", "止", "歹", "殳", "毋", "比", "毛", "氏", "气", "水", "火", "爪",
          "父", "爻", "爿", "片", "牙", "牛", "犬", "玄", "王", "瓜", "瓦", "甘", "生", "用", "田", "疋", "疒", "癶", "白", "皮", "皿", "目",
          "矛", "矢", "石", "示", "禸", "禾", "穴", "立", "竹", "米", "糸", "缶", "罒", "羊", "羽", "耂", "而", "耒", "耳", "聿", "肉", "臣",
          "自", "至", "臼", "舌", "舛", "舟", "艮", "色", "艹", "虍", "虫", "血", "行", "衣", "西", "見", "角", "言", "谷", "豆", "豕", "豸",
          "貝", "赤", "走", "足", "身", "車", "辛", "辰", "⻌", "邑", "酉", "釆", "里", "金", "長", "門", "⾩", "隶", "隹", "雨", "青", "非",
          "面", "革", "韋", "韭", "音", "頁", "風", "飛", "食", "首", "香", "馬", "骨", "高", "髟", "鬥", "鬯", "鬲", "鬼", "魚", "鳥", "鹵",
          "鹿", "麦", "麻", "黄", "黍", "黒", "黹", "黽", "鼎", "鼎", "鼓", "鼠", "齊", "歯", "竜", "亀", "龠"]


def get_file(radical, title):
    url = get_download_url(radical)
    response = requests.get(url, verify=False)
    if response.status_code == 200:
        with open("{}.gif".format(title), 'wb') as f:
            f.write(response.content)
    print("{} - {}".format(response.status_code, url))


def url_encode(radical):
    return urllib.urlencode({"kanji": radical})[6:]


def get_download_url(radical):
    response = requests.get(wiki_url.format(url_encode(radical), url_encode(radical)), verify=False)
    base_download_url = re.search(regex, response.content)
    print("{} - {}".format(response.status_code, base_download_url.group()))
    return "https:" + str(base_download_url.group()).replace("thumb/", "")[:-1]


if __name__ == '__main__':
    requests.packages.urllib3.disable_warnings()
    for index in range(10, 214):
        try:
            get_file(kanjis[index], index)
            time.sleep(5)
        except Exception:
            print("{} - {}".format(kanjis[index], index))
