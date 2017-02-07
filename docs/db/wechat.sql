/*
Navicat MySQL Data Transfer

Source Server         : 115.29.190.31
Source Server Version : 50632
Source Host           : 115.29.190.31:3306
Source Database       : wechat

Target Server Type    : MYSQL
Target Server Version : 50632
File Encoding         : 65001

Date: 2016-09-21 12:15:46
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `t_access_token`
-- ----------------------------
DROP TABLE IF EXISTS `t_access_token`;
CREATE TABLE `t_access_token` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `platform` smallint(5) unsigned NOT NULL DEFAULT '1' COMMENT '1-wechat 2-qq 3-weibo',
  `access_token` varchar(2048) NOT NULL,
  `expire_time` bigint(20) NOT NULL COMMENT '过期时间，毫秒',
  `mtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ctime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `platform` (`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- ----------------------------
-- Table structure for `t_autoreply_conf`
-- ----------------------------
DROP TABLE IF EXISTS `t_autoreply_conf`;
CREATE TABLE `t_autoreply_conf` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` smallint(6) NOT NULL COMMENT '1-被添加自动回复 2-消息自动回复 3-关键词自动回复 4-点击菜单回复',
  `keyid` varchar(512) DEFAULT NULL,
  `keyname` varchar(1024) DEFAULT NULL,
  `reply_type` varchar(128) DEFAULT NULL COMMENT 'text image voice video news',
  `reply_content` text,
  `reply_media_id` varchar(1024) DEFAULT NULL,
  `reply_rule_name` varchar(1024) DEFAULT NULL,
  `reply_rule_keywords` varchar(1024) DEFAULT NULL,
  `reply_rule_keywords_def` varchar(10240) DEFAULT NULL,
  `mtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ctime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- ----------------------------
-- Table structure for `t_subscribe_flow`
-- ----------------------------
DROP TABLE IF EXISTS `t_subscribe_flow`;
CREATE TABLE `t_subscribe_flow` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` smallint(6) NOT NULL DEFAULT '1' COMMENT '1-subscribe 0-unsubscribe',
  `openid` varchar(1024) NOT NULL,
  `unionid` varchar(1024) NOT NULL DEFAULT '',
  `scene_id` int(10) unsigned NOT NULL DEFAULT '0',
  `ctime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_subscribe_flow
-- ----------------------------

-- ----------------------------
-- Table structure for `t_subscribe_user`
-- ----------------------------
DROP TABLE IF EXISTS `t_subscribe_user`;
CREATE TABLE `t_subscribe_user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `subscribe` smallint(6) NOT NULL DEFAULT '1' COMMENT '1-关注 0-未关注',
  `openid` varchar(128) NOT NULL,
  `unionid` varchar(128) NOT NULL DEFAULT '',
  `nickname` varchar(1024) NOT NULL DEFAULT '',
  `sex` smallint(6) NOT NULL DEFAULT '0' COMMENT '1-man 2-woman',
  `headimgurl` varchar(2048) NOT NULL DEFAULT '',
  `subscribe_time` int(10) unsigned NOT NULL DEFAULT '0',
  `subscribe_scene_id` int(11) DEFAULT NULL,
  `groupid` int(11) NOT NULL DEFAULT '0',
  `mtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ctime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_subscribe_user
-- ----------------------------

-- ----------------------------
-- Table structure for `t_ticket`
-- ----------------------------
DROP TABLE IF EXISTS `t_ticket`;
CREATE TABLE `t_ticket` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` varchar(32) DEFAULT 'jsapi' COMMENT 'jsapi-jssdk wx_card-卡券',
  `ticket` varchar(2048) DEFAULT NULL,
  `expire_time` bigint(20) DEFAULT NULL COMMENT '过期日期的毫秒数表示形式',
  `mtime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ctime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `t_state_url_map` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `state` varchar(512) NOT NULL,
  `url` varchar(10240) NOT NULL,
  `invalid_time` bigint(20) DEFAULT NULL,
  `mtime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ctime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_media_local_url` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `media_type` varchar(255) DEFAULT 'image' COMMENT 'image video voice',
  `media_id` varchar(128) DEFAULT NULL,
  `media_name` varchar(1024) DEFAULT NULL,
  `media_url` varchar(4096) DEFAULT NULL,
  `update_time` bigint(20) DEFAULT NULL,
  `local_url` varchar(4096) DEFAULT NULL,
  `mtime` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `ctime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `media_id` (`media_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_menu_data` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `menu_type` varchar(128) DEFAULT 'normal',
  `menu_data` text,
  `mtime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ctime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `menu_type` (`menu_type`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_qrcode_scene` (
  `scene_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(512) DEFAULT NULL,
  `action_name` varchar(128) DEFAULT NULL COMMENT '二维码类型，QR_SCENE为临时,QR_LIMIT_SCENE为永久,QR_LIMIT_STR_SCENE为永久的字符串参数值',
  `expire_seconds` bigint(20) DEFAULT NULL COMMENT '临时二维码的过期时间，秒',
  `scene_str` varchar(128) DEFAULT NULL,
  `ticket` varchar(1024) DEFAULT NULL,
  `url` varchar(4096) DEFAULT NULL,
  `date_start` datetime DEFAULT NULL,
  `date_end` datetime DEFAULT NULL,
  `mtime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ctime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`scene_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_template_msg_send_flow` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `platform` varchar(128) DEFAULT 'MALL' COMMENT '发送平台 WXADMIN-管理系统 MALL-商城 O2O-o2o',
  `touser` varchar(1024) DEFAULT NULL,
  `template_id` varchar(1024) DEFAULT NULL,
  `url` varchar(4096) DEFAULT NULL,
  `data` text,
  `msgid` bigint(20) DEFAULT NULL COMMENT '消息ID',
  `status` int(11) DEFAULT '0' COMMENT '发送状态 0-成功',
  `ctime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_operate_log` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `userid` int(11) DEFAULT NULL,
  `email` varchar(1024) DEFAULT NULL,
  `url` varchar(1024) DEFAULT NULL,
  `url_params` text,
  `interface` varchar(1024) DEFAULT NULL,
  `interface_params` text,
  `status` int(11) DEFAULT NULL,
  `ctime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_template_list` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(128) NOT NULL DEFAULT '',
  `title` varchar(256) DEFAULT NULL,
  `rel_template_id` varchar(128) DEFAULT NULL,
  `data_desc` text,
  `mtime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ctime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;