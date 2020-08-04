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


def sort_json(data):
    title = data.get('title', None)
    name = data.get('name', None)
    images = data.get('images', None)
    links = data.get('links', None)
    objects = {}
    arrays = {}
    others = {}
    long_others = {}

    if data.has_key('title'):
        data.pop('title')
    if data.has_key('name'):
        data.pop('name')
    if data.has_key('images'):
        data.pop('images')
    if data.has_key('links'):
        data.pop('links')

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
            else:
                others[key] = value
        data.pop(key)

    newdata = collections.OrderedDict()

    if title is not None:
        newdata['title'] = title
    if name is not None:
        newdata['name'] = name

    for key, value in others.items(): 
        newdata[key] = value
        
    for key, value in long_others.items(): 
        newdata[key] = value

    for key, value in objects.items(): 
        newdata[key] = value
        
    for key, value in arrays.items(): 
        newdata[key] = value
        

    if links is not None:
        newdata['links'] = links
    if images is not None:
        newdata['images'] = images

    return newdata


def main(args):
    input_path = args['--input']
    input_paths = []

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
                        
                        json_file.seek(0)
                        json_file.write(json.dumps(data, indent=4))
                        json_file.truncate()


if __name__ == '__main__':
    arguments = docopt(__doc__, version='0.1.0')
    main(arguments)
