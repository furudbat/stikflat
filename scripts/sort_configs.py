"""Sort keys in Config-JSON

Usage:
  sort_configs.py
  sort_configs.py [--input=<templates-path>]
  sort_configs.py (-h | --help)
  sort_configs.py --version

Options:
  -h --help                     Show this screen.
  --version                     Show version.
  -i PATH, --input=PATH         Path to templates   [default: ./templates].

"""
from docopt import docopt
import os
import collections
import json
from jsonmerge import Merger


def sort_json(data):
    first_ordered = collections.OrderedDict()
    objects = {}
    arrays = {}
    others = {}
    others_ordered = collections.OrderedDict()
    arrays_ordered = collections.OrderedDict()
    long_others = collections.OrderedDict()

    if data.has_key('title'):
        first_ordered['title'] = data.get('title')
        data.pop('title')
    if data.has_key('name'):
        first_ordered['name'] = data.get('name')
        data.pop('name')
    if data.has_key('sex'):
        first_ordered['sex'] = data.get('sex')
        data.pop('sex')
    if data.has_key('gender'):
        first_ordered['gender'] = data.get('gender')
        data.pop('gender')
    if data.has_key('pronouns'):
        first_ordered['pronouns'] = data.get('pronouns')
        data.pop('pronouns')
    if data.has_key('age'):
        first_ordered['age'] = data.get('age')
        data.pop('age')
    if data.has_key('birthday'):
        first_ordered['birthday'] = data.get('birthday')
        data.pop('birthday')
    if data.has_key('weight'):
        first_ordered['weight'] = data.get('weight')
        data.pop('weight')
    if data.has_key('height'):
        first_ordered['height'] = data.get('height')
        data.pop('height')
    if data.has_key('build'):
        first_ordered['build'] = data.get('build')
        data.pop('build')
    if data.has_key('species'):
        first_ordered['species'] = data.get('species')
        data.pop('species')


    if data.has_key('theme'):
        others_ordered['theme'] = data.get('theme')
        data.pop('theme')
    if data.has_key('theme_link'):
        others_ordered['theme_link'] = data.get('theme_link')
        data.pop('theme_link')

        
    if data.has_key('pros'):
        arrays_ordered['pros'] = data.get('pros')
        data.pop('pros')
    if data.has_key('cons'):
        arrays_ordered['cons'] = data.get('cons')
        data.pop('cons')
    if data.has_key('likes'):
        arrays_ordered['likes'] = data.get('likes')
        data.pop('likes')
    if data.has_key('dislikes'):
        arrays_ordered['dislikes'] = data.get('dislikes')
        data.pop('dislikes')
    if data.has_key('hobbies'):
        arrays_ordered['hobbies'] = data.get('hobbies')
        data.pop('hobbies')

    images = data.get('images', None)
    links = data.get('links', None)
    moodboard = data.get('moodboard', None)
    if data.has_key('images'):
        data.pop('images')
    if data.has_key('links'):
        data.pop('links')
    if data.has_key('moodboard'):
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
        data.pop(key)

    long_others = collections.OrderedDict(sorted(long_others.items(), key=lambda x: len(x[1])))


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

    if links is not None:
        newdata['links'] = links
    if moodboard is not None:
        newdata['moodboard'] = moodboard
    if images is not None:
        newdata['images'] = images

    return newdata


def main(args):
    input_path = args['--input']
    input_paths = []
    merged_config = None

    for root, directories, files in os.walk(input_path, topdown=False):
        for name in directories:
            input_paths.append(os.path.join(root, name))

    for path in input_paths:
        for root, directories, files in os.walk(path, topdown=False):
            for file in files:
                ext = os.path.splitext(file)[-1].lower()

                if ext == '.json':
                    config_filename = os.path.abspath(os.path.join(root, file))
                    with open(config_filename, 'r+') as json_file:
                        data = json.load(json_file)
                        data = sort_json(data)

                        #print(json.dumps(data, indent=4, sort_keys=False))
                        merger = Merger({}) 
                        merged_config = merger.merge(merged_config, data)

                        json_file.seek(0)
                        json_file.write(json.dumps(data, indent=4, sort_keys=False))
                        json_file.truncate()
                    print('Sorted - ' + config_filename)

    merged_config = sort_json(merged_config)

    merged_config_filename = os.path.abspath(os.path.join(input_path, 'config.json'))
    with open(merged_config_filename, 'w') as merged_config_filename_file:
        merged_config_filename_file.write(json.dumps(merged_config, indent=4, sort_keys=False))


if __name__ == '__main__':
    arguments = docopt(__doc__, version='0.1.0')
    main(arguments)
