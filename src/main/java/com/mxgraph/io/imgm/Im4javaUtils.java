package com.mxgraph.io.imgm;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.im4java.core.*;
import org.im4java.process.ArrayListOutputConsumer;
import org.im4java.process.Pipe;

import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Im4javaUtils {
	
	private static Logger logger = Logger.getLogger(Im4javaUtils.class);
	
	/** ImageMagick 安装目录 **/
	//private static final String IMAGE_MAGICK_PATH =AppConfig.getConfigProp(CommonConst.IMAGEMAGICK_PATH);//ImageMagic安装目录
	/** GraphicsMagick 安装目录 **/
	//private static final String GRAPHICS_MAGICK_PATH = AppConfig.getConfigProp(CommonConst.GRAPHICSMAGICK_PATH); //GraphicsMagic安装目录
	
	private static final String IMAGE_MAGICK_PATH ="D:/ImageMagick-6.8.7-Q16";
	private static final String GRAPHICS_MAGICK_PATH = "D:/GraphicsMagick-1.3.27-Q8";

	private static ConvertCmd getConvertCmd(boolean isGraphics) {//graphics：是否使用GraphicsMagic
		ConvertCmd cmd = new ConvertCmd(isGraphics);
		if (isGraphics){
			if (StringUtils.isNotEmpty(GRAPHICS_MAGICK_PATH)){
				cmd.setSearchPath(GRAPHICS_MAGICK_PATH);
			}
		}else{
			if (StringUtils.isNotEmpty(IMAGE_MAGICK_PATH)){
				cmd.setSearchPath(IMAGE_MAGICK_PATH);
			}
		}
		return cmd;
	}
	
	private static IdentifyCmd getIdentifyCmd(boolean isGraphics) {
		IdentifyCmd cmd = new IdentifyCmd(isGraphics);
		if (isGraphics){
			if (StringUtils.isNotEmpty(GRAPHICS_MAGICK_PATH)){
				cmd.setSearchPath(GRAPHICS_MAGICK_PATH);
			}
		}else{
			if (StringUtils.isNotEmpty(IMAGE_MAGICK_PATH)){
				cmd.setSearchPath(IMAGE_MAGICK_PATH);
			}
		}
		return cmd;
	}
	
	private static CompositeCmd getCompositeCmd(boolean isGraphics) {
		CompositeCmd cmd = new CompositeCmd(isGraphics);
		if (isGraphics){
			if (StringUtils.isNotEmpty(GRAPHICS_MAGICK_PATH)){
				cmd.setSearchPath(GRAPHICS_MAGICK_PATH);
			}
		}else{
			if (StringUtils.isNotEmpty(IMAGE_MAGICK_PATH)){
				cmd.setSearchPath(IMAGE_MAGICK_PATH);
			}
		}
		return cmd;
	}
	
	/**
	 * 创建目录
	 * @param path
	 */
	private static void createDirectory(String path) {
		File file = new File(path);
		if (file.exists()) return;
		file.getParentFile().mkdirs();
	}

	/**
	 * 获取图片信息
	 * @param path 图片路径
	 * @return Map {height=, filelength=, directory=, width=, filename=}
	 * @throws Exception
	 */
	public static Map<String, String> getImageInfo(String path) throws Exception {
		IMOperation op = new IMOperation();
		op.format("%w,%h,%d,%f,%b");
		op.addImage(path);
		IdentifyCmd identifyCmd = getIdentifyCmd(true);
		ArrayListOutputConsumer output = new ArrayListOutputConsumer();
		identifyCmd.setOutputConsumer(output);
		identifyCmd.run(op);
		ArrayList<String> cmdOutput = output.getOutput();
		if (cmdOutput==null || cmdOutput.size() != 1) return null;
		String line = cmdOutput.get(0);
		String[] arr = line.split(",");
		Map<String, String> info = new HashMap<String, String>();
		info.put("width", arr[0]);
		info.put("height", arr[1]);
		info.put("directory", arr[2]);
		info.put("filename", arr[3]);
		info.put("filelength", arr[4]);
		return info;
	}
	
	public static Map<String, String> getImageInfo(InputStream stream) throws Exception {
		IMOperation op = new IMOperation();
		op.format("%w,%h,%d,%f,%b");
		op.addImage("-");
		IdentifyCmd identifyCmd = getIdentifyCmd(true);
		Pipe pipeIn = new Pipe(stream, null);
		identifyCmd.setInputProvider(pipeIn);
		ArrayListOutputConsumer output = new ArrayListOutputConsumer();
		identifyCmd.setOutputConsumer(output);
		identifyCmd.run(op);
		ArrayList<String> cmdOutput = output.getOutput();
		if (cmdOutput==null || cmdOutput.size() != 1) return null;
		String line = cmdOutput.get(0);
		String[] arr = line.split(",");
		Map<String, String> info = new HashMap<String, String>();
		info.put("width", arr[0]);
		info.put("height", arr[1]);
		info.put("directory", arr[2]);
		info.put("filename", arr[3]);
		info.put("filelength", arr[4]);
		return info;
	}
	
	public static Map<String, String> getImageInfo(byte[] bytes) throws Exception {
		ByteArrayInputStream inputStream = new ByteArrayInputStream(bytes);
		return getImageInfo(inputStream);
	}
	
	/**
	 * 获取图片宽度
	 * @param path 图片路径
	 * @return 宽度
	 * @throws Exception
	 */
	public static int getImageWidth(String path) throws Exception {
		return getImageWidthAndHeight(path)[0];
	}

	/**
	 * 获取图片高度
	 * @param path 图片路径
	 * @return 高度
	 * @throws Exception
	 */
	public static int getImageHeight(String path) throws Exception {
		return getImageWidthAndHeight(path)[1];
	}

	/**
	 * 获取图片宽度和高度
	 * @param path 图片路径
	 * @return [0]：宽度，[1]：高度
	 * @throws Exception
	 */
	public static int[] getImageWidthAndHeight(String path) throws Exception {
		Map<String, String> info = getImageInfo(path);
		return new int[] {Integer.parseInt(info.get("width")), Integer.parseInt(info.get("width"))};
	}

	/**
	 * 去除Exif信息，可减小文件大小
	 * @param path 原文件路径
	 * @param des 目标文件路径
	 * @throws Exception
	 */
	public static void removeProfile(String path, String des) throws Exception {
		createDirectory(des);
		IMOperation op = new IMOperation();
		op.addImage(path);
		op.profile("*");
		op.addImage(des);
		ConvertCmd cmd = getConvertCmd(true);
		cmd.run(op);
	}

	/**
	 * 降低品质，以减小文件大小
	 * @param path 原文件路径
	 * @param des 目标文件路径
	 * @param quality 保留品质（1-100）
	 * @throws Exception
	 */
	public static void reduceQuality(String path, String des, double quality) throws Exception {
		createDirectory(des);
		IMOperation op = new IMOperation();
		op.addImage(path);
		op.quality(quality);
		op.addImage(des);
		ConvertCmd cmd = getConvertCmd(true);
		cmd.run(op);
	}

	/**
	 * 改变图片大小:指定的高和宽
	 * @param path 原文件路径
	 * @param des 目标文件路径
	 * @param width 缩放后的宽度
	 * @param height 缩放后的高度
	 * @param sample 是否缩略图方式，而非缩放方式
	 * @throws Exception 
	 */
	public static void resizeImage(String path, String des, Integer width, Integer height, boolean sample) throws Exception {
		createDirectory(des);
		if (width == null || height == null) { // 等比缩放
			scaleImage(path, des, width, height, sample);
			return;
		}
		IMOperation op = new IMOperation();
		op.addImage(path);
		if (sample) op.sample(width, height);
		else op.resize(width, height, "!");//"!"参数：忽略等比和扭曲
		op.addImage(des);
		ConvertCmd cmd = getConvertCmd(true);
		cmd.run(op);
	}
	
	/**
	 * 改变图片大小
	 */
	public static boolean resiizeImage(String srcPath, String desPath,Integer width, Integer height) {

		IMOperation op = new IMOperation();
		op.addImage(); // place holder for input file
		op.resize(width,height);
		op.addImage(); // place holder for output file

		ConvertCmd convert = getConvertCmd(true);
		try {
			convert.run(op, srcPath, desPath);
		} catch (IOException e) {
			logger.error(e.getMessage());
			return false;
		} catch (InterruptedException e) {
			logger.error(e.getMessage());
			return false;
		} catch (IM4JavaException e) {
			logger.error(e.getMessage());
			return false;
		}
		return true;
	}

	/**
	 * 改变图片大小
	 */

	public static byte[] resiizeImage(InputStream stream,Integer width,Integer height) throws Exception {

		IMOperation op = new IMOperation();
		op.addImage("-");
		op.resize(width,height);
		op.addImage("-");
		Pipe pipeIn = new Pipe(stream, null);
		ByteArrayOutputStream fos = new ByteArrayOutputStream();
		Pipe pipeOut = new Pipe(null, fos);

		// set up command
		ConvertCmd convert = getConvertCmd(true);
		convert.setInputProvider(pipeIn);
		convert.setOutputConsumer(pipeOut);
		try {
			convert.run(op);
		} catch (IM4JavaException e) {
			logger.error(e);
		} finally {
			fos.close();
			stream.close();
		}
		return fos.toByteArray();
	}
	
	/**
	 * 改变图片大小
	 * 
	 */
	public static byte[] resiizeImage(byte[] bytes,Integer width,Integer height) throws Exception {

		IMOperation op = new IMOperation();
		op.addImage("-");
		op.resize(width,height);
		op.addImage("-");

		ByteArrayInputStream sbs = new ByteArrayInputStream(bytes);
		Pipe pipeIn = new Pipe(sbs, null);

		ByteArrayOutputStream fos = new ByteArrayOutputStream();
		Pipe pipeOut = new Pipe(null, fos);

		// set up command
		ConvertCmd convert = getConvertCmd(true);
		convert.setInputProvider(pipeIn);
		convert.setOutputConsumer(pipeOut);

		try {
			convert.run(op);
		} catch (IM4JavaException e) {
			logger.error(e);
		} finally {
			fos.close();
			sbs.close();
		}
		return fos.toByteArray();
	}

	/**
	 * 等比缩放图片（如果width为空，则按height缩放; 如果height为空，则按width缩放）
	 * @param path 原文件路径
	 * @param des 目标文件路径
	 * @param width 缩放后的宽度
	 * @param height 缩放后的高度
	 * @param sample 是否缩略图方式，而非缩放方式
	 * @throws Exception 
	 */
	public static void scaleImage(String path, String des, Integer width, Integer height, boolean sample) throws Exception {
		createDirectory(des);
		IMOperation op = new IMOperation();
		op.addImage(path);
		if (sample) op.sample(width, height);
		else op.resize(width, height);
		op.addImage(des);
		ConvertCmd cmd = getConvertCmd(true);
		cmd.run(op);
	}

	/**
	 * 从原图中裁剪出新图
	 * @param path 原文件路径
	 * @param des 目标文件路径
	 * @param x 原图左上角
	 * @param y 原图左上角
	 * @param width 新图片宽度
	 * @param height 新图片高度
	 * @throws Exception
	 */
	public static void cropImage(String path, String des, int x, int y, int width, int height) throws Exception {
		createDirectory(des);
		IMOperation op = new IMOperation();
		op.addImage(path);
		op.crop(width, height, x, y);
		op.addImage(des);
		ConvertCmd cmd = getConvertCmd(true);
		cmd.run(op);
	} 
	
	/**
	 * 图片裁剪
	 */
	public static byte[] cropImage(byte[] bytes,Integer width, Integer height, int x, int y) throws Exception {

		IMOperation op = new IMOperation();
		op.addImage("-");
		op.append().crop(width, height, x, y);
		op.addImage("-");

		ByteArrayInputStream sbs = new ByteArrayInputStream(bytes);
		Pipe pipeIn = new Pipe(sbs, null);

		ByteArrayOutputStream fos = new ByteArrayOutputStream();
		Pipe pipeOut = new Pipe(null, fos);

		// set up command
		ConvertCmd convert = getConvertCmd(true);
		convert.setInputProvider(pipeIn);
		convert.setOutputConsumer(pipeOut);

		try {
			convert.run(op);
		} catch (IM4JavaException e) {
			logger.error(e);
		} finally {
			fos.close();
			sbs.close();
		}
		return fos.toByteArray();
	}

	/**
	 *
	 * @param svgPath
	 * @param outputPath
	 */
	public static void convertSVG2EPS(String svgPath,String outputPath) {
		IMOperation op = new IMOperation();
		op.addImage(svgPath);
		op.addImage(outputPath);
		//op.font("C:/Windows/Fonts/Helvetica");
		ConvertCmd cmd = getConvertCmd(false);
		try {
			cmd.setSearchPath(IMAGE_MAGICK_PATH);
			cmd.run(op);
		} catch (IOException e) {
			e.printStackTrace();
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (IM4JavaException e) {
			e.printStackTrace();
		}
	}
	
	 /**
     * 图片旋转
     *
     * @param imagePath 源图片路径
     * @param outPath   处理后图片路径
     * @param degree    旋转角度
     */
	public static void rotateImage(String imagePath, String outPath, double degree) throws Exception {
		// 1.将角度转换到0-360度之间
		degree = degree % 360;
		if (degree <= 0) {
			degree = 360 + degree;
		}
		IMOperation op = new IMOperation();
		op.addImage(imagePath);
		op.rotate(degree);
		op.addImage(outPath);
		ConvertCmd cmd = getConvertCmd(true);
		cmd.run(op);
	}
	
	/**
     * 旋转并裁图
     * @param imgPath 原始图片
     * @param outPath 输出图片
     * @param degree  旋转角度
     * @param x       起始值 x坐标
     * @param y       起始Y坐标
     * @param width   裁图宽
     * @param height  裁图高
     * @return
     */
    public static void rotateAndCut(String imgPath, String outPath, double degree,int x, int y, int width, int height) throws Exception {
    	// 1.将角度转换到0-360度之间
        degree = degree % 360;
        if (degree <= 0) {
            degree = 360 + degree;
        }
        IMOperation op = new IMOperation();
        op.addImage(imgPath);
        op.rotate(degree);
        op.crop(width, height, x, y);
        op.addImage(outPath);
        ConvertCmd cmd = getConvertCmd(true);
        cmd.run(op);
    }
    
    /**
     * 添加文字水印
     * @param srcPath   原始图片
     * @param destPath  目标图片
     * @param text      文字   "text 5,5 'hello world'", 其中 hello world 为要绘制的内容
     * @param fontType  文字字体  "宋体"
     * @param fontSize  字体大小  18
     * @param gravity   文字位置  "southeast"
     * @param fontColor 文字颜色 "#BCBFC8"
     * @throws Exception
     */
	public static void addTextMark(String srcPath, String destPath, String text, String fontType, int fontSize,String gravity, String fontColor) throws Exception {
		IMOperation op = new IMOperation();
		op.font(fontType);
		op.gravity(gravity);
		op.pointsize(fontSize);
		op.fill(fontColor);
		op.draw(text);
		op.addImage();
		op.addImage();
		ConvertCmd convert = getConvertCmd(true);
		convert.run(op, srcPath, destPath);
	}
	
	/**
     * 图片水印
     * @param srcImagePath   源图片
     * @param waterImagePath 水印
     * @param destImagePath  生成图片
     * @param gravity        图片位置
     * @param dissolve       水印透明度
     */
	public static void addImageMark(String waterImagePath, String srcImagePath, String destImagePath, String gravity,int dissolve) throws Exception {
		IMOperation op = new IMOperation();
		op.gravity(gravity);
		op.dissolve(dissolve);
		op.addImage(waterImagePath);
		op.addImage(srcImagePath);
		op.addImage(destImagePath);
		CompositeCmd cmd = getCompositeCmd(true);
		cmd.run(op);
	}
	
	/** 
     * 图片合成 
     * @param args 
     * @param maxWidth 
     * @param maxHeight 
     * @param newpath 
     * @param mrg 
     * @param type 1:横,2:竖 
     */  
    public static void montage(String[] args,Integer maxWidth,Integer maxHeight,String newpath,Integer mrg,String type) {  
        IMOperation op = new IMOperation();
        ConvertCmd cmd = getConvertCmd(true);
        String thumb_size = maxWidth+"x"+maxHeight+"^";  
        String extent = maxWidth+"x"+maxHeight;  
        if("1".equals(type)){  
            op.addRawArgs("+append");  
        }else if("2".equals(type)){  
            op.addRawArgs("-append");  
        }  
          
        op.addRawArgs("-thumbnail",thumb_size);  
        op.addRawArgs("-gravity","center");  
        op.addRawArgs("-extent",extent);  
          
        Integer border_w = maxWidth / 40;  
        op.addRawArgs("-border",border_w+"x"+border_w);  
        op.addRawArgs("-bordercolor","#ccc");  
          
        op.addRawArgs("-border",1+"x"+1);  
        op.addRawArgs("-bordercolor","#fff");  
          
        for(String img : args){  
            op.addImage(img);  
        }  
        if("1".equals(type)){  
            Integer whole_width = ((mrg / 2) +1 + border_w + maxWidth + border_w + (mrg / 2) +1)*args.length - mrg;  
            Integer whole_height = maxHeight + border_w + 1;  
            op.addRawArgs("-extent",whole_width + "x" +whole_height);  
        }else if("2".equals(type)){  
            Integer whole_width = maxWidth + border_w + 1;  
            Integer whole_height = ((mrg / 2) +1 + border_w + maxHeight + border_w + (mrg / 2) +1)*args.length - mrg;  
            op.addRawArgs("-extent",whole_width + "x" +whole_height);  
        }  
        op.addImage(newpath);  
        try {  
            cmd.run(op);  
        } catch (Exception e) {  
            e.printStackTrace();  
        }  
    }  
	
	/**
	 * 将图片分割为若干小图
	 * @param path 原文件路径
	 * @param des 目标文件路径
	 * @param width 指定宽度（默认为完整宽度）
	 * @param height 指定高度（默认为完整高度）
	 * @return 小图路径
	 * @throws Exception
	 */
	public static List<String> subsectionImage(String path, String des, Integer width, Integer height) throws Exception {
		createDirectory(des);
		IMOperation op = new IMOperation();
		op.addImage(path);
		op.crop(width, height);
		op.addImage(des);
		ConvertCmd cmd = getConvertCmd(true);
		cmd.run(op);
		return getSubImages(des);
	}

	/**
	 * <ol>
	 * <li>去除Exif信息</li>
	 * <li>按指定的宽度等比缩放图片</li>
	 * <li>降低图片品质</li>
	 * <li>将图片分割成指定高度的小图</li>
	 * @param path 原文件路径
	 * @param des 目标文件路径
	 * @param width 指定宽度
	 * @param subImageHeight 指定高度
	 * @param quality 保留品质
	 * @return 小图路径
	 * @throws Exception
	 */
	public static List<String> HightImage(String path, String des, int width, int subImageHeight, double quality) throws Exception {
		createDirectory(des);
		IMOperation op = new IMOperation();
		op.addImage(path);

		op.profile("*");
		op.resize(width, null);
		op.quality(quality);
		op.crop(null, subImageHeight);

		op.addImage(des);
		ConvertCmd cmd = getConvertCmd(true);
		cmd.run(op);

		return getSubImages(des);
	}

	/**
	 * 获取图片分割后的小图路径
	 * @param des 目录路径
	 * @return 小图路径
	 */
	private static List<String> getSubImages(String des) {
		String fileDir = des.substring(0, des.lastIndexOf(File.separatorChar)); // 文件所在目录
		String fileName = des.substring(des.lastIndexOf(File.separatorChar) + 1); // 文件名称
		String n1 = fileName.substring(0, fileName.lastIndexOf(".")); // 文件名（无后缀） 
		String n2 = fileName.replace(n1, ""); // 后缀

		List<String> fileList = new ArrayList<String>();
		String path = null;
		for (int i = 0;; i++) {
			path = fileDir + File.separatorChar + n1 + "-" + i + n2;
			if (new File(path).exists()) fileList.add(path);
			else break;
		}
		return fileList;
	}
	
	public static void main(String[] args) throws Exception {
		/*InputStream inputStream=new FileInputStream("e:/test.jpg");
		Map map=getImageInfo(IOUtils.toByteArray(inputStream));
		System.out.println(map);*/

		convertSVG2EPS("D:/112.svg","D:/112.eps");

		/*byte[] bytes=Im4javaUtils.resiizeImage(inputStream,200, null);
		File file = new File("e:/test1.jpg");  
		OutputStream fos = new FileOutputStream(file); 
		fos.write(bytes);*/
        
		/*Map<String, Object> map=getImageInfo("e:/test.jpg");
		Map<String, Object> info = new HashMap<String, Object>();
		System.out.println(map.get("width"));
		System.out.println(map.get("height"));
		System.out.println(map.get("directory"));
		System.out.println(map.get("filename"));
		System.out.println(map.get("filelength"));*/
		
		//reduceQuality("e:/test.jpg","e:/test1.jpg",0.5);
		/*resizeImage("e:/test.jpg", "e:/test2.jpg", 200, 300, true);
		resizeImage("e:/test.jpg", "e:/test3.jpg", 200, 300, false);*/
		
		//addTextMark("e:/test.jpg","e:/test2.jpg", "text 5,5 'hello world'", "", 20,"southeast", "#ff0000");
		
		// reduceQuality("C:\\img\\i.jpg", "C:\\img\\i_.jpg", 80);
		// System.out.println(getImageInfo("C:\\img\\2.jpg"));
		// scaleResizeImage("C:\\img\\2.jpg", "C:\\img\\3.jpg", 100, 50, false);
		// removeProfile("C:\\img\\3.jpg", "C:\\img\\3.jpg");
		// reduceQuality("C:\\img\\3.jpg", "C:\\img\\3.jpg", 80);
		//
		// List<String> list = subsectionImage("C:\\2.jpg", "C:\\img\\1.jpg",
		// null, 1000);
		// System.out.println(list);
		//
		// cropImage("C:\\2.jpg", "C:\\img\\1.jpg", 1000, 1000, 1600, 1000);
		//
		// scaleResizeImage("C:\\2.jpg", "C:\\img\\3.jpg", null, 1000, false);
		// scaleResizeImage("C:\\2.jpg", "C:\\img\\3_.jpg", null, 1000, true);

		// List<String> list = Hd("C:\\2.jpg", "C:\\img1\\1.jpg", 1600,
		// 1000, 90);
		// for (String s : list) {
		// System.out.println(s);
		// }

		// System.out.println(new File("C:\\4.jpg").isDirectory());

		/*List<String> list = Hd("C:\\2.jpg", "D:\\a\\b\\c\\abc.jpg", 1600, 700, 90);
		System.out.println(list.toString().replace("[", "").replace("]", "").replaceAll(", ", "\r\n"));
		System.out.println("完成");*/
	}

}
