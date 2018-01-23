package com.mxgraph.io.imgm;

import org.apache.commons.lang.StringUtils;

import java.io.IOException;
import java.util.Properties;

/**
 * 应用配置属性
 * 1：application.properties属性文件的配置
 * Lyn 2017-07-23 19:36:36  www.36588.com.cn
 * 改为spring ProLoadUtils读取配置
 */
public class AppConfig {
	
	private static Properties properties=null;//系统属性配置
	
	/**
     * 加载属性配置文件
     */
    public static final void loadConfigProp() {
	/*	try {
			if (properties==null) {
				//properties = PropertiesLoaderUtils.loadAllProperties(CommonConst.APPLICATION_PROPERTY_FILE);
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}*/
	}
    
    /**
	 * 获取配置属性值
	 */
    public static String getConfigProp(String propName) {
        if(properties == null) {
            loadConfigProp();
        }
        String val=properties.getProperty(propName);
        return StringUtils.isEmpty(val)?"":encode(val);
    }
    
    /**
     * 得到整数属性值
     */
    public static int getIntProp(String propertyName){
    	String val= getConfigProp(propertyName);
    	return StringUtils.isEmpty(val)?0:Integer.parseInt(val);
    }
    
    /**
     * 得到布尔属性值
     */
    public static boolean getBooleanProp(String propertyName) {
		String val = getConfigProp(propertyName);
		return StringUtils.isEmpty(val) ? false : "ON".equalsIgnoreCase(val) 
				|| "YES".equalsIgnoreCase(val)
				|| "TRUE".equalsIgnoreCase(val);
	}
    
    private static String encode(String str) {
		try{
		    return new String(str.getBytes("ISO-8859-1"),"UTF-8");
		}catch(Exception e){
			return str;
		}
	}
    
    /**
     * 得到应用程序名称
     */
    public static String getApplicationName(){
    	return getConfigProp(CommonConst.APPLICATION_NAME);
    }
    
    
    /**
     * 得到上传的根路径
     */
    public static String getUploadRoot(){
    	return getConfigProp(CommonConst.UPLOAD_ROOT);
    }
    
    /**
     * 是否启动了定时任务调度功能
     */
    public static boolean isSchedulerON(){
    	return getBooleanProp(CommonConst.SCHEDULER_ON);
    }
    
    /**
     * 得到36588系统URL
     */
    public static String get36588Domain(){
    	return getConfigProp("36588.domain");
    }
    
    /**
     * 得到这里印系统URL
     */
    public static String getZheliyinDomain(){
    	return getConfigProp("zheliyin.domain");
    }
    /**
     * 得到36588diy设计器URL
     */
    public static String get36588DiyDomain(){
    	return getConfigProp("36588.diyWeb.domain");
    }
    
    /**
     * 得到36588diy设计器URL
     */
    public static String getZheliyinDiyDomain(){
    	return getConfigProp("zheliyin.diyWeb.domain");
    }
    
}
