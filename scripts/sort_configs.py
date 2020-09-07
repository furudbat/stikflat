"""Sort keys in Config-JSON

Usage:
  sort_configs.py
  sort_configs.py [--only-check] [--strict] [--input=<templates-path>]
  sort_configs.py (-h | --help)
  sort_configs.py --version

Options:
  -h --help                     Show this screen.
  --version                     Show version.
  -i PATH, --input=PATH         Path to templates   [default: ./templates].
  --only-check                  Only check config.json for keywords (do not write new configs)

"""
from docopt import docopt
import os
import collections
import re
import json
import yaml
import pystache
from jsonmerge import Merger


def sort_json(data):
    first_ordered = collections.OrderedDict()
    objects = dict()
    arrays = dict()
    others = dict()
    others_ordered = collections.OrderedDict()
    arrays_ordered = collections.OrderedDict()
    long_others = collections.OrderedDict()

    if 'title' in data:
        first_ordered['title'] = data.get('title')
        data.pop('title')
    if 'name' in data:
        first_ordered['name'] = data.get('name')
        data.pop('name')
    if 'sex' in data:
        first_ordered['sex'] = data.get('sex')
        data.pop('sex')
    if 'gender' in data:
        first_ordered['gender'] = data.get('gender')
        data.pop('gender')
    if 'pronouns' in data:
        first_ordered['pronouns'] = data.get('pronouns')
        data.pop('pronouns')
    if 'age' in data:
        first_ordered['age'] = data.get('age')
        data.pop('age')
    if 'birthday' in data:
        first_ordered['birthday'] = data.get('birthday')
        data.pop('birthday')
    if 'weight' in data:
        first_ordered['weight'] = data.get('weight')
        data.pop('weight')
    if 'height' in data:
        first_ordered['height'] = data.get('height')
        data.pop('height')
    if 'build' in data:
        first_ordered['build'] = data.get('build')
        data.pop('build')
    if 'species' in data:
        first_ordered['species'] = data.get('species')
        data.pop('species')

    if 'theme' in data:
        others_ordered['theme'] = data.get('theme')
        data.pop('theme')
    if 'theme_link' in data:
        others_ordered['theme_link'] = data.get('theme_link')
        data.pop('theme_link')

    if 'pros' in data:
        arrays_ordered['pros'] = data.get('pros')
        data.pop('pros')
    if 'cons' in data:
        arrays_ordered['cons'] = data.get('cons')
        data.pop('cons')
    if 'likes' in data:
        arrays_ordered['likes'] = data.get('likes')
        data.pop('likes')
    if 'dislikes' in data:
        arrays_ordered['dislikes'] = data.get('dislikes')
        data.pop('dislikes')
    if 'hobbies' in data:
        arrays_ordered['hobbies'] = data.get('hobbies')
        data.pop('hobbies')

    avatar_credit = data.get('avatar_credit', None)
    avatar_credit_link = data.get('avatar_credit_link', None)
    images = data.get('images', None)
    socialmedia = data.get('socialmedia', None)
    colors = data.get('colors', None)
    links = data.get('links', None)
    moodboard = data.get('moodboard', None)

    if 'avatar_credit' in data:
        data.pop('avatar_credit')
    if 'avatar_credit_link' in data:
        data.pop('avatar_credit_link')
    if 'images' in data:
        data.pop('images')
    if 'colors' in data:
        data.pop('colors')
    if 'links' in data:
        data.pop('links')
    if 'socialmedia' in data:
        data.pop('socialmedia')
    if 'moodboard' in data:
        data.pop('moodboard')

    for key, value in data.items():
        if isinstance(value, dict):
            objects[key] = value
        elif isinstance(value, list):
            arrays[key] = value
        else:
            if key == 'bio':
                long_others[key] = value
            elif key == 'description':
                long_others[key] = value
            elif key == 'personality':
                long_others[key] = value
            elif key == 'about':
                long_others[key] = value
            elif key == 'appearance':
                long_others[key] = value
            elif key == 'extra':
                long_others[key] = value
            elif key == 'quote':
                long_others[key] = value
            elif key == 'summary':
                long_others[key] = value
            elif key == 'trivia':
                long_others[key] = value
            else:
                others[key] = value
        #data.pop(key)

    long_others = collections.OrderedDict(
        sorted(long_others.items(), key=lambda x: len(x[1])))

    others = dict(sorted(others.items(), reverse=True))
    long_others = dict(sorted(long_others.items(), reverse=True))
    objects = dict(sorted(objects.items(), reverse=True))
    arrays = dict(sorted(arrays.items(), reverse=True))

    newdata = collections.OrderedDict()
    for key, value in first_ordered.items():
        newdata[key] = value

    for key, value in others.items():
        newdata[key] = value

    for key, value in others_ordered.items():
        newdata[key] = value

    for key, value in long_others.items():
        newdata[key] = value

    for key, value in objects.items():
        newdata[key] = value

    for key, value in arrays_ordered.items():
        newdata[key] = value

    for key, value in arrays.items():
        newdata[key] = value

    if colors is not None:
        newdata['colors'] = colors
    if socialmedia is not None:
        newdata['socialmedia'] = socialmedia
    if links is not None:
        newdata['links'] = links
    if moodboard is not None:
        newdata['moodboard'] = moodboard
    if avatar_credit is not None:
        newdata['avatar_credit'] = avatar_credit
    if avatar_credit_link is not None:
        newdata['avatar_credit_link'] = avatar_credit_link
    if images is not None:
        newdata['images'] = images

    return newdata


def check_keys(config_filename, data):

    if 'bio' in data.keys() and 'about' in data:
        print("{}: beware of \"mixing\" or using 'bio' instead of 'about', 'about is an INFO about an character and Bio is about HISTORY/BACKGROUND'".format(config_filename))


    if 'theme' in data.keys() and not 'theme_link' in data:
        print('{}: "theme" is set but "theme_link" is missing'.format(config_filename))
    elif 'theme_link' in data.keys() and not 'theme' in data:
        print('{}: "theme_link" is set but "theme" is missing'.format(config_filename))
        

    if 'background' in data:
        print('{}: "background" found use "ethnicity" instead'.format(config_filename))

    if 'aesthetic' in data:
        print('{}: "aesthetic" found use "appearance" instead'.format(config_filename))

    if 'residence' in data:
        print('{}: "residence" found use "location" instead'.format(config_filename))
    
    if 'job' in data:
        print('{}: "job" found use "occupation" instead'.format(config_filename))
    if 'role' in data:
        print('{}: "role" found use "occupation" instead'.format(config_filename))
        
    
    if 'icon' in data and not data['icon'].startswith('f'):
        print('{}: Are you sure "icon" is a Fonr Awesome Icon'.format(config_filename))


    if ('interests' in data and (not isinstance(data['interests'], list))) or ('interest' in data and (isinstance(data['interest'], list))):
        print('{}: use "interests" for a list and "interest" for singe entry'.format(config_filename))
        
    if ('notes' in data and (not isinstance(data['notes'], list))) or ('note' in data and (isinstance(data['note'], list))):
        print('{}: use "notes" for a list and "note" for singe entry'.format(config_filename))

    if ('trivias' in data and (not isinstance(data['trivias'], list))) or ('trivia' in data and (isinstance(data['trivia'], list))):
        print('{}: use "trivias" for a list and "trivia" for singe entry'.format(config_filename))

    if ('traits' in data and (not isinstance(data['traits'], list))) or ('trait' in data and (isinstance(data['trait'], list))):
        print('{}: use "traits" for a list and "trait" for singe entry'.format(config_filename))

def test_mustache(template_filename, config_filename):
    with open(template_filename, 'r') as template_file:
        template = template_file.read().decode('utf-8')
        with open(config_filename, 'r') as config_file:
            config_str=config_file.read()
            config = json.loads(config_str)

            try:
                renderer = pystache.Renderer(missing_tags='strict')
                parsed = pystache.parse(template)
                rendered = renderer.render(parsed, config)
                if not rendered:
                    print('{}: template or result is empty'.format(template_filename))
            except pystache.context.KeyNotFoundError as e:
                if not re.match(".*.length", e.key):
                    print('{}: {} not found in config'.format(config_filename, e.key))

def sortConfig(input_path, input_paths, type='', only_checks=False, strict=False):
    merged_config=None
    keys=collections.OrderedDict()
    files_counter=0

    for path in input_paths:
        for root, directories, files in os.walk(path, topdown=False):
            config_filename=None
            template_filename=None
            meta_yml_filename=None
            meta={}
            template_engine_mustache=False
            for file in files:
                extensions=file.split('.')[1:]
                ext=os.path.splitext(file)[-1].lower()

                if (ext == '.html' and (len(extensions) == 1 or 'mustache' in extensions)) or ext == '.mustache':
                    template_engine_mustache=True
                if ext == '.html' or ext == '.mustache':
                    template_filename = os.path.abspath(os.path.join(root, file))
                if ext == '.json':
                    meta_yml_filename=os.path.abspath(os.path.join(root, 'meta.yml'))
                    with open(meta_yml_filename) as yml_file:
                        meta=yaml.load(yml_file, Loader=yaml.FullLoader)

                    config_filename=os.path.abspath(os.path.join(root, file))
                    with open(config_filename, 'r+') as json_file:
                        if not only_checks:
                            print('progress {} ...'.format(config_filename))

                        data=json.load(json_file)
                        data=sort_json(data)

                        check_keys(config_filename, data)

                        # print(json.dumps(data, indent=4, sort_keys=False))
                        merger=Merger({})
                        if 'type' in meta and meta['type'] == type:
                            merged_config=merger.merge(merged_config, data)
                            for key in data.keys():
                                if key in keys:
                                    keys[key]=keys[key] + 1
                                else:
                                    keys[key]=1
                            files_counter=files_counter+1

                        if not only_checks:
                            json_file.seek(0)
                            json_file.write(json.dumps(
                                data, indent=4, sort_keys=False))
                            json_file.truncate()
                    if not only_checks:
                        print('Sorted - ' + config_filename)
            if template_engine_mustache:
                if strict:
                    test_mustache(template_filename, config_filename)

    merged_config=sort_json(merged_config)

    sorted_keys={k: v for k, v in sorted(keys.items(), key=lambda item: item[1])}
    max_sorted_keys=list(sorted_keys.values())[-1]
    filter_keys=set({key: value for (key, value) in sorted_keys.items() if value == max_sorted_keys}.keys())
    filter_keys.add('title')
    filter_keys.add('name')
    minimal_merged_config=collections.OrderedDict(filter(lambda elem: elem[0] in filter_keys, merged_config.items()))

    if not only_checks:
        minimal_config_filename='minimal_' + type + '_config.json'
        check_keys(minimal_config_filename, minimal_merged_config)

        minimal_merged_config_filename=os.path.abspath(
            os.path.join(input_path, minimal_config_filename))
        with open(minimal_merged_config_filename, 'w') as minimal_merged_config_file:
            minimal_merged_config_file.write(json.dumps(
                minimal_merged_config, indent=4, sort_keys=False))

        config_filename=type + '_config.json'
        check_keys(config_filename, merged_config)
        merged_config_filename=os.path.abspath(
            os.path.join(input_path, config_filename))
        with open(merged_config_filename, 'w') as merged_config_file:
            merged_config_file.write(json.dumps(
                merged_config, indent=4, sort_keys=False))


def main(args):
    input_path=args['--input']
    only_checks=args['--only-check']
    strict=args['--strict']
    input_paths=[]

    for root, directories, files in os.walk(input_path, topdown=False):
        for name in directories:
            if name != 'zz_character_fullconfig' and name != 'zz_user_fullconfig' and name != 'zz_character_minimalconfig' and name != 'zz_user_minimalconfig':
                input_paths.append(os.path.join(root, name))

    sortConfig(input_path, input_paths, 'character', only_checks, strict)
    sortConfig(input_path, input_paths, 'user', only_checks, strict)


if __name__ == '__main__':
    arguments=docopt(__doc__, version='0.1.0')
    main(arguments)
