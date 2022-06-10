FROM fedora:35

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash && \
	source ~/.bashrc && \
	nvm install 16

RUN dnf install -y python39

COPY build-ffmpeg.sh /build-ffmpeg.sh
RUN bash build-ffmpeg.sh
