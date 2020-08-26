"""Generate Template Meta Data.

Usage:
  gen_data_templates.py
  gen_data_templates.py [--input=<templates-path>] [--output=<yml-output-filename>] [--target-templates-path=<target-path>]
  gen_data_templates.py (-h | --help)
  gen_data_templates.py --version

Options:
  -h --help                     Show this screen.
  --version                     Show version.
  -i PATH, --input=PATH         Path to templates   [default: ./templates].
  -o PATH, --output=PATH        YML Output Path [default: ./_data/].
  --target-templates-path=PATH  Target path to 'templates' [default: ./templates]

"""
from docopt import docopt
import os
import yaml
import json


def main(args):
    output_path = args['--output']
    input_path = args['--input']
    input_paths = []
    templates = []
    templates_target_path = args['--target-templates-path']

    output_templates_filename = os.path.join(output_path, 'templates.yml')
    output_creator_filename = os.path.join(output_path, 'creators.yml')

    templates = []

    for root, directories, files in os.walk(input_path, topdown=False):
        for name in directories:
            input_paths.append(os.path.join(root, name))

    for path in input_paths:
        for root, directories, files in os.walk(path, topdown=False):
            template = {}
            keywords = []
            disabled = False

            template['id'] = os.path.basename(os.path.normpath(root))
            for file in files:
                ext = os.path.splitext(file)[-1].lower()

                if ext == '.html' or ext == '.mustache':
                    template['template'] = os.path.normpath(os.path.relpath(os.path.abspath(
                        os.path.join(root, file)), templates_target_path)).replace('\\', '/')
                elif ext == '.css':
                    template['css'] = os.path.normpath(os.path.relpath(os.path.abspath(
                        os.path.join(root, file)), templates_target_path)).replace('\\', '/')
                elif ext == '.json':
                    template['config'] = os.path.normpath(os.path.relpath(os.path.abspath(
                        os.path.join(root, file)), templates_target_path)).replace('\\', '/')
                    with open(os.path.abspath(os.path.join(root, file))) as json_file:
                        data = json.load(json_file)
                        keywords = [str(r) for r in data.keys()]
                elif file == 'meta.yml':
                    template['meta'] = os.path.normpath(os.path.relpath(os.path.abspath(
                        os.path.join(root, file)), templates_target_path)).replace('\\', '/')
                    meta_yml_filename = os.path.abspath(
                        os.path.join(root, file))
                    with open(meta_yml_filename) as yml_file:
                        meta = yaml.load(yml_file, Loader=yaml.FullLoader)
                        for key, value in meta.items():
                            template[key] = value
                        disabled = ('disable' in meta and meta['disable']) or (
                            'disabled' in meta and meta['disabled'])

            template['keywords'] = keywords
            if not disabled:
                templates.append(template)

    creatorsmap = {}
    creatorslist = set()
    for template in templates:
        creatorslist.add(template['author'])
    for creator in creatorslist:
        for template in templates:
            if 'author' in template and creator == template['author']:
                if creator != 'furudbat':
                    if creator in creatorsmap:
                        if 'author_avatar' in template and template['author_avatar'] != '':
                            creatorsmap[creator]['author_avatar'] = template['author_avatar']
                    else:
                        creatorsmap[creator] = {}
                        creatorsmap[creator]['name'] = creator
                        if 'author_avatar' in template and template['author_avatar'] != '':
                            creatorsmap[creator]['author_avatar'] = template['author_avatar']

    creators = list(creatorsmap.values())

    print('write ' + output_templates_filename + ' ...')
    #print(templates)
    with open(output_templates_filename, 'w') as output:
        yaml.dump(templates, output)
        print('Done ' + output_templates_filename)

    print('write ' + output_creator_filename + ' ...')
    #print(creators)
    with open(output_creator_filename, 'w') as output:
        yaml.dump(creators, output)
        print('Done ' + output_creator_filename)


if __name__ == '__main__':
    arguments = docopt(__doc__, version='0.1.0')
    main(arguments)
