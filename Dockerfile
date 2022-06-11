# Fedora 35 + Node 16 + Python + FFmpeg

FROM fedora:35

ENV PATH="/root/bin:$PATH"
WORKDIR /dj
ENTRYPOINT yarn install && yarn tsc && yarn start

RUN yum update -y

# 1. Node 16
RUN dnf module install -y nodejs:16 && npm i -g yarn
RUN npm -v && node -v && yarn -v

# 2. Python 3.9
RUN dnf install -y python39
RUN python3 -V && python -V

# 3. FFmpeg
## 3.1 Assemblers
### 3.1.0 Dependencies
RUN yum install -y autoconf automake bzip2 bzip2-devel cmake diffutils freetype-devel gcc gcc-c++ git libtool make pkgconfig zlib-devel
RUN mkdir ~/ffmpeg_sources
### 3.1.1 NASM
RUN cd ~/ffmpeg_sources && \
	curl -O -L https://www.nasm.us/pub/nasm/releasebuilds/2.15.05/nasm-2.15.05.tar.bz2 && \
	tar xjvf nasm-2.15.05.tar.bz2 && \
	cd nasm-2.15.05 && \
	./autogen.sh && \
	./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" && \
	make && \
	make install
### 3.1.2 Yasm
RUN cd ~/ffmpeg_sources && \
	curl -O -L https://www.tortall.net/projects/yasm/releases/yasm-1.3.0.tar.gz && \
	tar xzvf yasm-1.3.0.tar.gz && \
	cd yasm-1.3.0 && \
	./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" && \
	make && \
	make install
## 3.2 libraries
### 3.2.1 libx264
RUN cd ~/ffmpeg_sources && \
	git clone --branch stable --depth 1 https://code.videolan.org/videolan/x264.git && \
	cd x264 && \
	PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig" ./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" --enable-static && \
	make && \
	make install
### 3.2.2 libx265
RUN cd ~/ffmpeg_sources && \
	git clone --branch stable --depth 2 https://bitbucket.org/multicoreware/x265_git && \
	cd ~/ffmpeg_sources/x265_git/build/linux && \
	cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX="$HOME/ffmpeg_build" -DENABLE_SHARED:bool=off ../../source && \
	make && \
	make install
### 3.2.3 libfdk_aac
RUN cd ~/ffmpeg_sources && \
	git clone --depth 1 https://github.com/mstorsjo/fdk-aac && \
	cd fdk-aac && \
	autoreconf -fiv && \
	./configure --prefix="$HOME/ffmpeg_build" --disable-shared && \
	make && \
	make install
### 3.2.4 libmp3lame
RUN cd ~/ffmpeg_sources && \
	curl -O -L https://downloads.sourceforge.net/project/lame/lame/3.100/lame-3.100.tar.gz && \
	tar xzvf lame-3.100.tar.gz && \
	cd lame-3.100 && \
	./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" --disable-shared --enable-nasm && \
	make && \
	make install
### 3.2.5 libopus
RUN cd ~/ffmpeg_sources && \
	curl -O -L https://archive.mozilla.org/pub/opus/opus-1.3.1.tar.gz && \
	tar xzvf opus-1.3.1.tar.gz && \
	cd opus-1.3.1 && \
	./configure --prefix="$HOME/ffmpeg_build" --disable-shared && \
	make && \
	make install
### 3.2.6 libvpx
RUN cd ~/ffmpeg_sources && \
	git clone --depth 1 https://chromium.googlesource.com/webm/libvpx.git && \
	cd libvpx && \
	./configure --prefix="$HOME/ffmpeg_build" --disable-examples --disable-unit-tests --enable-vp9-highbitdepth --as=yasm && \
	make && \
	make install
## FFmpeg compile
RUN cd ~/ffmpeg_sources && \
curl -O -L https://ffmpeg.org/releases/ffmpeg-snapshot.tar.bz2 && \
tar xjvf ffmpeg-snapshot.tar.bz2 && \
cd ffmpeg && \
PATH="$HOME/bin:$PATH" PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig" ./configure \
  --prefix="$HOME/ffmpeg_build" \
  --pkg-config-flags="--static" \
  --extra-cflags="-I$HOME/ffmpeg_build/include" \
  --extra-ldflags="-L$HOME/ffmpeg_build/lib" \
  --extra-libs=-lpthread \
  --extra-libs=-lm \
  --bindir="$HOME/bin" \
  --enable-gpl \
  --enable-libfdk_aac \
  --enable-libfreetype \
  --enable-libmp3lame \
  --enable-libopus \
  --enable-libvpx \
  --enable-libx264 \
  --enable-libx265 \
  --enable-nonfree && \
make && \
make install
RUN hash -d ffmpeg
RUN rm -rf ~/ffmpeg_sources
