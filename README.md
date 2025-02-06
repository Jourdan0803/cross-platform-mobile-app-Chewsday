# ece5904project - chewsday

## Figma Design

https://www.figma.com/design/X4RGbeesThwtoDPzqqudgW/Chewsday?node-id=0-1&t=8F3WsY4nFPxx4jRL-1

## Instructions for running the application

To run this application, you first need to clone this repository:

git clone https://gitlab.oit.duke.edu/hg161/ece5904project.git

Then you will find two directories, chewsday is the front-end and backend is the back-end.

### Backend

For the backend, our idea is to run it as a daemon on a virtual machine (can be Duke VCM or another cloud service provider). Currently our backend runs on vcm-43365.vm.duke.edu, so you don't need to pay attention to any contents of the backend directory, nor do you need to run the backend manually.

### Chewsday App

To run the Chewsday app, cd into the chewsday folder and run:

npm install --force

After the installation is complete, run:

npm start

After that, you can press different buttons to run on different platforms according to the instructions, or you can run the app on your phone by scanning the QR code (Expo Go needs to be installed)
