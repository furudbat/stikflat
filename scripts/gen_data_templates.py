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
  -o FILE, --output=FILE        YML Output filename [default: ./_data/templates.yml].
  --target-templates-path=PATH  Target path to 'templates' [default: ./templates]

"""
from docopt import docopt
import os

import yaml


def main(args):
    output_filename = args['--output']
    input_path = args['--input']
    input_paths = []
    templates = []
    templates_target_path = args['--target-templates-path']

    templates = []

    for root, directories, files in os.walk(input_path, topdown=False):
        for name in directories:
            input_paths.append(os.path.join(root, name))

    for path in input_paths:
        for root, directories, files in os.walk(path, topdown=False):
            template = {}
            for file in files:
                ext = os.path.splitext(file)[-1].lower()

                if ext == '.html' or ext == '.mustache':
                    template['template'] = os.path.relpath(os.path.abspath(
                        os.path.join(root, file)), templates_target_path).replace('\\', '/')
                elif ext == '.css':
                    template['css'] = os.path.relpath(os.path.abspath(
                        os.path.join(root, file)), templates_target_path).replace('\\', '/')
                elif ext == '.json':
                    template['config'] = os.path.relpath(os.path.abspath(
                        os.path.join(root, file)), templates_target_path).replace('\\', '/')
                elif file == 'meta.yml':
                    meta_yml_filename = os.path.abspath(
                        os.path.join(root, file))
                    with open(meta_yml_filename) as yml_file:
                        meta = yaml.load(yml_file, Loader=yaml.FullLoader)
                        for key, value in meta.items():
                            template[key] = value

            templates.append(template)

    with open(output_filename, 'w') as output:
        yaml.dump(templates, output)
        print('Done ' + output_filename)


if __name__ == '__main__':
    arguments = docopt(__doc__, version='0.1.0')
    main(arguments)
